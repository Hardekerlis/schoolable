import { Request, Response } from 'express';
import {
  BadRequestError,
  LANG,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-common';

import Session from '../models/session';

import logger from '../utils/logger';

const check = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];

  logger.info('Starting cookie check');

  logger.debug('Checking if cookie is signed');
  if (req.cookies.token && !currentUser) {
    logger.debug('Cookie is not signed');

    logger.debug('Removing token cookie');
    res.clearCookie('token');
    throw new BadRequestError(lang.badSession);
  }
  logger.debug('Cookie is signed');

  logger.debug('Checking if a token cookie is present in request');
  if (!currentUser) {
    logger.debug('No token cookie found in request');
    throw new NotAuthorizedError();
  }
  logger.debug('Found token cookie in request');

  logger.debug('Looking up session');
  const session = await Session.findById(currentUser.sessionId);

  if (!session) {
    logger.debug('No session found');

    logger.debug('Removing token cookie');
    res.clearCookie('token');
    throw new NotAuthorizedError();
  }
  logger.debug('Found session');

  logger.info('Successfully validated user session. Returning to user');

  res.status(200).json({
    errors: false,
    message: lang.validSession,
  });
};

export default check;
