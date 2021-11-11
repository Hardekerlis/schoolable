import {
  Listener,
  Subjects,
  UserRemovedEvent,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import User from '../../../models/user';
import File from '../../../models/file';

import logger from '../../../utils/logger';

export class UserRemovedListener extends Listener<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: UserRemovedEvent['data'], msg: Message) {
    const { userId, removingAdmin } = data;

    logger.info(`Removing user with id ${userId}`);

    logger.debug('Looking up user to remove');
    const userToRemove = await User.findByIdAndRemove(userId);

    if (!userToRemove) {
      logger.error('No user to remove found. This should never happen');
      return msg.ack();
    }
    logger.debug('Found user');

    logger.debug('Looking up courses associated with user');
    const files = await File.find({
      $or: [{ owner: userToRemove.id }, { access: { users: userToRemove.id } }],
    });

    logger.debug('Checking if any files are are associated with user');
    if (files[0]) {
      logger.debug(`${files.length} files are associated with user`);
      logger.debug('Looping through them');
      for (const file of files) {
        // @ts-ignore
        const index = file.access?.users.indexOf(userId);

        logger.debug('Removing user from file');
        file.access?.users.splice(index, 1);

        logger.debug('Saving file');
        await file.save();
      }
    } else logger.debug('No files are associated with user');

    logger.info('Successfully removed user from course');

    msg.ack();
  }
}
