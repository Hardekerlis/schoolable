import {
  Listener,
  Subjects,
  UserCreatedEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import logger from '../../utils/logger';
import User from '../../models/user';

// REVIEW: This might not be neccessary
export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { userType, name, userId } = data;

    logger.info('Creating user reference');

    logger.debug('Building user');
    const user = User.build({
      userType,
      name,
      userId,
    });

    logger.debug('Saving user');
    await user.save();

    console.log(user, userId);
    msg.ack();
  }
}
