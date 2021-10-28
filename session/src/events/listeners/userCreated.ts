import {
  Listener,
  Subjects,
  UserCreatedEvent,
  CONFIG,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';
import { nanoid } from 'nanoid';

import { queueGroupName } from './';
import { SessionContextPublisher } from '../publishers';

import logger from '../../utils/logger';
import { natsWrapper } from '../../utils/natsWrapper';
import User from '../../models/user';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { userId, email, userType, lang, name } = data;

    logger.info('Creating user');

    // The temp password will be emailed to the user
    const tempPassword = nanoid();
    logger.debug(
      `Creating temp password. ${
        CONFIG.dev ? `TempPassword: ${tempPassword}` : '' // This is for development. It should never be logged in production
      }`,
    );

    logger.debug('Building user');
    const user = User.build({
      userId,
      email,
      password: tempPassword,
      userType,
      lang,
      name,
    });

    logger.debug('Saving user');
    await user.save();
    logger.debug('Successfully saved user');

    new SessionContextPublisher(natsWrapper.client, logger).publish({
      userId,
      tempPassword,
    });

    logger.verbose('Sent Nats session context event');

    logger.info('User reference created');
    msg.ack();
  }
}
