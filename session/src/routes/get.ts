import { Request, Response } from 'express';
import {
  NotAuthorizedError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';
import { UserPayload } from '@gustafdahl/schoolable-interfaces';
import jwt from 'jsonwebtoken';

import Session from '../models/session';
import User from '../models/user';
import logger from '../utils/logger';

const get = async (req: Request, res: Response) => {
  let loginId;
  if (req.cookies.loginId) {
    logger.warn('Login id cookie is not signed');
    loginId = req.cookies.loginId;
  } else if (req.signedCookies.loginId) {
    loginId = req.signedCookies.loginId;
  } else {
    logger.debug('No login id cookie found');
    throw new NotAuthorizedError();
  }

  const session = await Session.findOne({ loginId }).populate('user');

  if (!session) {
    throw new NotAuthorizedError();
  }

  const payload: UserPayload = {
    email: session.user.email,
    sessionId: session.id,
    id: session.user.userId,
    userType: session.user.userType,
    name: session.user.name,
    lang: session.user.lang,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);

  res.clearCookie('loginId');
  res.cookie('sesstok', token);
  res.redirect(200, '/');
};

export default get;
