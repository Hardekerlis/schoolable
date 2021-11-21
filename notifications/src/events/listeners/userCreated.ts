import {
  Listener,
  Subjects,
  UserCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import User from '../../models/user';

import logger from '../../utils/logger';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { userId, email, userType, name } = data;

    logger.info('Creating user reference');

    logger.debug('Building user');
    const user = User.build({
      id: userId,
      email,
      userType,
      name,
    });

    logger.debug('Saving user');
    await user.save();

    logger.info('Successfully created user reference');
    msg.ack();
  }
}
