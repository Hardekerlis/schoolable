import {
  Listener,
  Subjects,
  UserRemovedEvent,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import User from '../../models/user';
import Group from '../../models/group';

import logger from '../../utils/logger';

export class UserRemovedListener extends Listener<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: UserRemovedEvent['data'], msg: Message) {
    const { userId } = data;

    logger.info('Attempting to remove user');

    logger.debug('Removing user');
    await User.findByIdAndRemove(userId);

    logger.debug('Looking up groups');
    const groups = await Group.find({ users: userId });

    if (!groups[0]) {
      logger.debug('No groups found');
      return msg.ack();
    }
    logger.debug('Found groups');

    logger.debug('Looping through groups');
    for (const group of groups) {
      logger.debug('Getting index of user');
      const userIndex = group.users?.indexOf(userId)!;

      logger.debug('Removing user from group');
      group.users?.splice(userIndex, 1);

      logger.debug('Saving group');
      await group.save();
    }

    logger.info('Successfully removed user');

    msg.ack();
  }
}
