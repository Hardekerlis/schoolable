import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-common';

import User from '../models/user';
import Group from '../models/group';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { GroupRemovedUserPublisher } from '../events/publishers';

const removeUsers = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  const { groupId, users } = req.body;

  logger.info('Attempting to remove users from group');

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

    logger.debug('Getting the user index');
    const userIndex = group.users?.indexOf(userId)!;

    logger.debug('Removing user from user group');
    group.users?.splice(userIndex, 1);
  }

  logger.debug('Saving group');
  await group.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new GroupRemovedUserPublisher(natsWrapper.client, logger).publish({
      name: group.name,
      groupId: group.id,
      users: group.users as string[],
    });

    logger.verbose('Sent Nats group removed user event');
  }

  logger.info('Succesfully added users to group');

  res.status(200).json({
    errors: false,
    message: lang.addedToGroup,
    group,
  });
};

export default removeUsers;
