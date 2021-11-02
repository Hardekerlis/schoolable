import {
  Listener,
  Subjects,
  RemoveUserEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import User from '../../models/user';
import { UserRemovedPublisher } from '../publishers/userRemoved';
import logger from '../../utils/logger';

// TODO: Remvoe users settings aswell

export class RemoveUserListener extends Listener<RemoveUserEvent> {
  subject: Subjects.RemoveUser = Subjects.RemoveUser;
  queueGroupName = queueGroupName;

  async onMessage(data: RemoveUserEvent['data'], msg: Message) {
    const { userId, removingAdmin } = data;
    logger.info(`Preparing to delete user with id ${userId}`);

    logger.debug('Looking up user and removing it');
    const userToBeRemoved = await User.findById(userId).populate('settings');

    if (!userToBeRemoved) {
      logger.error("Couldn't find user to remove");
      return msg.ack();
    }

    await userToBeRemoved.settings.remove();
    await userToBeRemoved.remove();

    logger.debug('Publishing user was deleted');
    new UserRemovedPublisher(this.client, logger).publish({
      userId: userId,
      removingAdmin,
    });

    msg.ack();
  }
}
