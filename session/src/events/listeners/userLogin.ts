import {
  Listener,
  Subjects,
  UserLoginEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import logger from '../../utils/logger';
import Session from '../../models/session';

// REVIEW: This might not be neccessary
export class UserLoginListener extends Listener<UserLoginEvent> {
  subject: Subjects.UserLogin = Subjects.UserLogin;
  queueGroupName = queueGroupName;

  async onMessage(data: UserLoginEvent['data'], msg: Message) {
    const { userId, ip, userAgent, loginId } = data;

    logger.info(`User with id ${userId} logged in. Creating session`);

    console.log(data);
    msg.ack();
  }
}
