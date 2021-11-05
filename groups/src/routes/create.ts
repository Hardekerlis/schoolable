import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import User from '../models/user';
import Group from '../models/group';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { GroupCreatedPublisher } from '../events/publishers';

const create = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  const { users, name } = req.body;

  logger.info('Attempting to create group');

  const usersToBeAdded: string[] = [];
  logger.debug('Checking if users should be added on creation');
  if (users && users.length !== -1) {
    logger.debug('Looping through users to be added');
    for (const user of users) {
      logger.debug('Making sure that the supplied user id is a valid ObjectId');
      if (!isValidObjectId(user)) {
        logger.debug('User id is not a valid ObjectId');
        return res.status(400).json({
          errors: false,
          message: lang.invalidUserId,
        });
      }
      logger.debug('User id is a valid ObjectId');

      logger.debug('Checking if user exists');
      const userExists = !!(await User.findById(user));

      if (!userExists) {
        logger.debug('User does not exists');
        return res.status(404).json({
          errors: false,
          message: lang.noUserFound,
          userId: user,
        });
      }
      logger.debug('User exists');

      logger.debug('Adding user to group');
      usersToBeAdded.push(user);
    }
  }

  logger.debug('Building group');
  const group = Group.build({
    name: name as string,
    users: usersToBeAdded,
  });

  logger.debug('Saving group');
  await group.save();

  // Publishes event to nats service
  new GroupCreatedPublisher(natsWrapper.client, logger).publish({
    name: group.name,
    groupId: group.id,
    users: group.users as string[],
  });

  logger.verbose('Sent Nats group created event');

  logger.info('Successfully created group');

  res.status(201).json({
    errors: false,
    message: lang.createdGroup,
    group,
  });
};

export default create;
