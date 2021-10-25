import { Request, Response } from 'express';
import {
  LANG,
  NotAuthorizedError,
  CONFIG,
  UserPayload,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';

import Session from '../models/session';
import logger from '../utils/logger';

const get = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  let loginId;
  logger.info('Getting session');

  if (req.cookies.loginId) {
    logger.warn('Login id cookie is not signed');
    loginId = req.cookies.loginId;
  } else if (req.signedCookies.loginId) {
    logger.debug('Cookie is signed');
    loginId = req.signedCookies.loginId;
  } else {
    logger.debug('No login id cookie found');
    throw new NotAuthorizedError();
  }

  logger.debug('Looking up session');
  const session = await Session.findOne({ loginId }).populate('user');

  if (!session) {
    logger.debug('No session found');
    throw new NotAuthorizedError();
  }
  logger.debug('Found session');

  logger.debug('Creating user payload');
  const payload: UserPayload = {
    email: session.user.email,
    sessionId: session.id,
    id: session.user.userId,
    userType: session.user.userType,
    name: session.user.name,
    lang: session.user.lang,
  };

  logger.debug('Creating jwt');
  const token = jwt.sign(payload, process.env.JWT_KEY as string);

  logger.debug('Removing login id cookie');
  res.clearCookie('loginId');
  logger.debug('Setting token cookie');
  res.cookie('token', token, CONFIG.cookies);
  logger.info('Successfully fetched session. Returning to user');
  res.status(200).json({ errors: false, message: lang.gotSession });
};

export default get;
