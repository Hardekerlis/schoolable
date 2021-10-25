import { Request, Response } from 'express';
import {
  UnexpectedError,
  BadRequestError,
  UserTypes,
  LANG,
} from '@gustafdahl/schoolable-common';

import UserRemovedPublisher from '../events/publishers/userRemoved';
import { natsWrapper } from '../utils/natsWrapper';
import User from '../models/user';
import logger from '../utils/logger';

// TODO: This should queue user for deletion instead of removing it
// TODO: Create nats listener for removal complete
const remove = async (req: Request, res: Response) => {
  const { id } = req.body;

  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Looking up user to delete');
  // Try to find the user to be removed
  const userToRemove = await User.findById(id).populate('settings');

  // Check if a user was found
  if (!userToRemove) {
    logger.info('No user to delete found');
    // No user found
    throw new BadRequestError(lang.noUserFoundId);
  } else {
    logger.info('Checking if the user to be removed is of type admin');

    // Check to see if account type to be deleted is admin
    if (userToRemove.userType === UserTypes.Admin) {
      logger.info('User is of type admin');

      logger.info('Checking if there are more than one admin account');
      // Find atleast 2 admin accounts
      const isAccountLastAdminAccount = await User.find({
        userType: UserTypes.Admin,
      }).limit(2); // Limiting results because we only need to know if there are more than 1 admin

      // Check if there are more than 1 admin account
      if (isAccountLastAdminAccount.length === 1) {
        logger.info(
          "Only one admin account found. Can't remove the last admin",
        );

        // User is not allowed to delete the last admin account
        return res.status(405).json({
          errors: [{ message: lang.lastAdmin }],
        });
      }
    } else {
      logger.info('User to be removed is not an admin');
      try {
        logger.info('Removing user and users settings');
        await userToRemove.remove();
        await userToRemove.settings.remove();

        // Couldnt get nats mock to work
        // Code is only ran if its not test environment
        if (process.env.NODE_ENV !== 'test') {
          // Publishes event to nats service
          // TODO: Change this to UserQueueRemove
          new UserRemovedPublisher(natsWrapper.client, logger).publish({
            userId: userToRemove.id,
          });

          logger.info('Sent Nats user removed event');
        }

        logger.info('Successfully removed user and settings');
        res.status(200).json({
          errors: false,
          message: 'Removed user',
          userId: userToRemove.id,
        });
      } catch (err) {
        logger.error(`Ran into an unexpected error. Error message: ${err}`);
        throw new UnexpectedError();
      }
    }
  }
};

export default remove;
