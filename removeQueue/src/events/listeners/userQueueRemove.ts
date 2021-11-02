import {
  Listener,
  UserQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import logger from '../../utils/logger';

import { queueGroupName } from './queueGroupName';
import removeUserQueue from '../../queues/removeUserQueue';

export class UserQueueRemoveListener extends Listener<UserQueueRemoveEvent> {
  subject: Subjects.UserQueueRemove = Subjects.UserQueueRemove;
  queueGroupName = queueGroupName;

  async onMessage(data: UserQueueRemoveEvent['data'], msg: Message) {
    const { userId, removeAt, removingAdmin } = data;

    const delay = new Date(removeAt).getTime() - new Date().getTime();

    logger.info(`Trying to add user with id ${userId} to remove queue`);

    try {
      await removeUserQueue.add(
        {
          userId,
          removingAdmin,
        },
        {
          delay: delay,
        },
      );
    } catch (err) {
      console.error(err);
    }

    logger.info(
      `Waiting ${delay} milliseconds before removing user with id ${userId}`,
    );

    msg.ack();
  }
}
