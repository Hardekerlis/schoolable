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
    const { name, userId, email, userType } = data;

    logger.info('Creating user reference');

    const user = User.build({ userId, email, name, userType });

    logger.debug('Saving user to database');
    await user.save();

    logger.info('Successfully save user to database');
    msg.ack();
  }
}
