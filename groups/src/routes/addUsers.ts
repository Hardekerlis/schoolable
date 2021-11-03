import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-common';

import User from '../models/user';
import Group from '../models/group';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { GroupAddedUserPublisher } from '../events/publishers';

const addUsers = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  const { groupId, users } = req.body;

  logger.info('Attempting to add users to group');

  logger.debug('Looking up group');
  const group = await Group.findById(groupId);

  if (!group) {
    logger.debug('No group found');
    return res.status(404).json({
      errors: false,
      message: lang.noGroupFound,
    });
  }
  logger.debug('Found group');

  logger.debug('Looping through users');
  for (const userId of users) {
    logger.debug(`Checking if user with id ${userId} exists`);
    const userExists = !!(await User.findById(userId));

    if (!userExists) {
      logger.debug("User doesn't exist");
      return res.status(404).json({
        errors: false,
        message: lang.noUserFound,
        userId: userId,
      });
    }
    logger.debug('User exists');

    logger.debug('Adding user to user group');
    group.users?.push(userId);
  }

  logger.debug('Saving group');
  await group.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new GroupAddedUserPublisher(natsWrapper.client, logger).publish({
      name: group.name,
      groupId: group.id,
      users: group.users as string[],
    });

    logger.verbose('Sent Nats group created event');
  }

  logger.info('Succesfully added users to group');

  res.status(200).json({
    errors: false,
    message: lang.addedToGroup,
    group,
  });
};

export default addUsers;
