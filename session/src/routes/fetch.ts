import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import {
  BadRequestError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';

import Session from '../models/session';
import User from '../models/user';
import logger from '../utils/logger';

const fetch = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];

  logger.info('Fetching active sessions');

  logger.debug('Looking up user');
  const user = await User.findOne({ userId: currentUser?.id });

  if (!user) {
    logger.error('No user found. This should never happen');
    res.clearCookie('token');
    throw new UnexpectedError();
  }
  logger.debug('Found user');

  logger.debug('Looking for sessions');
  const sessions = await Session.find({
    user: user.id,
  }).select('-loginId -user');

  if (!sessions[0]) {
    logger.debug('No sessions found');
    res.clearCookie('token');
    throw new BadRequestError(lang.noSessionsFound);
  }

  logger.debug('Found sessions');

  logger.info('Active sessions found. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.foundSessions,
    sessions,
  });
};

export default fetch;
