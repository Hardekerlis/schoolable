import {
  Listener,
  Subjects,
  UserRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import User from '../../models/user';

import { io } from '../../sockets';

import logger from '../../utils/logger';

// TODO: Remove all data associated with user
export class UserRemovedListener extends Listener<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: UserRemovedEvent['data'], msg: Message) {
    const { userId } = data;

    logger.info('Removing user reference');

    const userToRemove = await User.findById(userId);

    if (!userToRemove) {
      logger.error('No user to remove. Report this to the developers');
      return msg.ack();
    }

    logger.debug('Checking if there are any active socket sessions');
    if ((userToRemove.sockets as string[])[0]) {
      logger.debug('Found socket sessions');

      logger.debug(
        `Looping through ${userToRemove.sockets?.length} active sockets`,
      );
      for (const socketId of userToRemove.sockets!) {
        logger.debug('Getting active socket');
        const socket = io.sockets.sockets.get(socketId);

        if (!socket) {
          logger.error(`Couldn't find active socket with id ${socketId}`);
          continue;
        }

        logger.debug('Disconnecting socket');
        socket.disconnect(true);
      }
    } else logger.debug('No socket sessions found');

    logger.info('Successfully removed user reference');
    msg.ack();
  }
}
