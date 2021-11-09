import { Request, Response } from 'express';
import {
  LANG,
  CONFIG,
  UserPayload,
  BadRequestError,
  Location,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';

import Session from '../models/session';
import User from '../models/user';

import logger from '../utils/logger';
import Password from '../utils/password';

const login = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  const { email, password } = req.body;

  logger.info('Starting login');

  logger.debug('Looking up user');
  const user = await User.findOne({ email });

  if (!user) {
    logger.debug('No user found');
    throw new BadRequestError(lang.wrongCredentials);
  }
  logger.debug('Found user');

  logger.debug('Comparing passwords');
  if (await Password.compare(user.password, password)) {
    logger.debug('Password was correct');

    // REVIEW: This might not be good enough. Is it possible for this to fail?
    logger.debug('Getting ip from request');
    const ip =
      (req.headers['x-real-ip'] as string) ||
      (process.env.NODE_ENV === 'test' ? '78.73.146.89' : '');

    logger.debug('Getting geo data based on ip');
    const geo: Location = geoip.lookup(ip)!;
    logger.debug('Getting user-agent from request');
    const userAgent = req.headers['user-agent'] || 'userAgent';

    logger.debug('Checking if there was a user agent in request');
    if (userAgent === 'userAgent' && process.env.NODE_ENV !== 'test') {
      logger.debug('No user agent found in request');
      throw new BadRequestError(lang.funnyBusiness);
    }

    // TODO: Fix this excellent code
    if (!geo?.city) {
      geo.city = 'undefined';
    }

    logger.debug('Building session');
    const session = Session.build({
      user: user,
      location: geo,
      userAgent: userAgent,
      ip: ip,
    });

    logger.debug('Saving session');
    await session.save();
    logger.debug('Successfully saved session');

    const payload: UserPayload = {
      email: user.email,
      sessionId: session.id,
      id: user.userId,
      userType: user.userType,
      name: user.name,
      lang: user.lang,
    };

    logger.debug('Creating token');
    const token = jwt.sign(payload, process.env.JWT_KEY as string);

    logger.debug('Setting cookie');
    res.cookie('token', token, CONFIG.cookies);

    logger.info('Successfully logged in');
    res.status(200).json({
      errors: false,
      message: lang.gotSession,
      user,
    });
  } else {
    logger.debug('Wrong password');
    throw new BadRequestError(lang.wrongCredentials);
  }
};

export default login;
