import {
  Listener,
  Subjects,
  UserLoginEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';
import geoip from 'geoip-lite';
import { Location } from '@gustafdahl/schoolable-interfaces';

import { queueGroupName } from './queueGroupName';
import logger from '../../utils/logger';
import Session from '../../models/session';
import User, { UserDoc } from '../../models/user';

export class UserLoginListener extends Listener<UserLoginEvent> {
  subject: Subjects.UserLogin = Subjects.UserLogin;
  queueGroupName = queueGroupName;

  async onMessage(data: UserLoginEvent['data'], msg: Message) {
    const { userId, ip, userAgent, loginId } = data;

    logger.info(`User with id ${userId} logged in. Creating session`);

    logger.debug('Looking up user');
    const user = await User.findOne({ userId });
    logger.debug('Found user');

    logger.debug(`Looking up geo for ip`);
    const geo: Location = geoip.lookup(ip)!;

    logger.debug('Building session');
    const session = Session.build({
      user: user as UserDoc,
      loginId,
      creationTimestamp: `${+new Date()}`,
      userAgent: userAgent,
      location: geo,
      ip,
    });

    logger.debug('Saving session');
    await session.save();
    logger.info('Created session');

    msg.ack();
  }
}
