import { Request, Response } from 'express';
import {
  LANG,
  UserTypes,
  CONFIG,
  BadRequestError,
} from '@gustafdahl/schoolable-common';
import { DateTime } from 'luxon';

import User from '../models/user';

import { UserQueueRemovePublisher } from '../events/publishers';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

const remove = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { userId } = req.body;
  const lang = LANG[`${req.lang}`];
  logger.info('Attempting to queue user to be removed');

  logger.debug('Looking up user to be deleted');
  const userToRemove = await User.findById(userId);

  if (!userToRemove) {
    logger.debug('No user found');
    return res.status(404).json({
      errors: false,
      message: lang.noUserFound,
    });
  }
  logger.debug('Found user');

  logger.debug('Checking user is to be deleted is of type admin');
  if (userToRemove.userType === UserTypes.Admin) {
    logger.debug('User to be deleted is of type admin');

    logger.debug('Looking up admins in database');
    const adminAccounts = await User.find({ userType: UserTypes.Admin }).limit(
      2,
    );

    logger.debug('Checking if there are more than 1 admin account in database');
    if (adminAccounts.length === 1) {
      logger.debug(
        "There is only one admin account in database. Can't remove the last one",
      );
      return res.status(405).json({
        errors: [{ message: lang.lastAdmin }],
      });
    }
    logger.debug('There are more than 1 admin account in database. Continuing');
  } else logger.debug('User to be deleted is not of type admin');

  logger.debug('Checking if user already is up for deletion');
  if (userToRemove.deletion?.isUpForDeletion === true) {
    logger.debug('User is already up for deletion');
    throw new BadRequestError(lang.alreadyUpForDeletion);
  }
  logger.debug('User is not already up for deletion');

  const removeAt = DateTime.now()
    .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
    .toJSDate();

  logger.debug('Setting date to when the account is to be deleted by');
  userToRemove.deletion = {
    isUpForDeletion: true,
    removeAt,
  };

  logger.debug('Saving user');
  await userToRemove.save();

  // Publishes event to nats service
  new UserQueueRemovePublisher(natsWrapper.client, logger).publish({
    userId: userToRemove.id as string,
    removingAdmin: currentUser?.id as string,
    removeAt: removeAt,
  });

  logger.verbose('Sent Nats course queue remove event');

  logger.info('Successfully queued user to be deleted');

  res.status(200).json({
    errors: false,
    message: lang.upForDeletion,
    user: userToRemove,
  });
};

export default remove;
