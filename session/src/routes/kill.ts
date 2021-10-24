import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import {
  UnexpectedError,
  NotAuthorizedError,
  NotFoundError,
} from '@gustafdahl/schoolable-errors';
import { isValidObjectId } from 'mongoose';

import Session from '../models/session';
import User from '../models/user';

import logger from '../utils/logger';

// TODO: Add logger and comments

export const killCurrent = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];

  logger.info('Attempting to kill current session');

  logger.debug('Removing token cookie');
  res.clearCookie('token');

  logger.debug('Looking up session and attempting to removing it');
  const removedSession = await Session.findByIdAndRemove(
    currentUser!.sessionId,
  );
  logger.debug('Finished looking up session');

  if (!removedSession) {
    logger.debug('No session found');
    return res.status(404).json({
      errors: false,
      message: lang.noSessionFound,
    });
  }

  logger.debug('Found and removed session');

  logger.info('Successfully killed session');

  res.status(200).json({
    errors: false,
    message: lang.killedCurrentSession,
  });
};

export const killAll = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];

  logger.info('Attempting to remove all sessions for user');

  logger.debug('Removing token cookie');
  res.clearCookie('token');

  logger.debug('Looking up user');
  const user = await User.findOne({ userId: currentUser?.id });
  logger.debug('Finished looking up user');

  if (!user) {
    logger.debug('No user found');
    throw new UnexpectedError();
  }

  logger.debug('Found user');

  logger.debug('Looking up sessions and attempting to remove them');
  const { deletedCount } = await Session.deleteMany({ user: user.id });

  if (deletedCount === 0) {
    logger.debug("Couldn't find any sessions");
    return res.status(404).json({
      errors: false,
      message: lang.noSessionsFound,
    });
  }

  logger.debug('Found sessions and removed them');

  logger.info('Successfully killed all sessions');

  res.status(200).json({
    errors: false,
    message: lang.killedAllSessions,
  });
};

export const killById = async (req: Request, res: Response) => {
  const sessId = req.params.sessionId;
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];

  if (!isValidObjectId(sessId)) {
    throw new NotFoundError();
  }

  logger.info('Attempting to kill session by id');

  logger.debug('Looking up session with id');
  const session = await Session.findById(sessId).populate('user');

  if (!session) {
    logger.debug('No session found');
    return res.status(404).json({
      errors: false,
      message: lang.noSessionFound,
    });
  }

  logger.debug('Found session');

  logger.debug('Checking if user is allowed to remove session');
  if (session.user.userId.toString() !== currentUser?.id) {
    logger.debug('User is not allowed to remove session');
    throw new NotAuthorizedError();
  }

  logger.debug('User is allowed to remove session');

  logger.debug('Removing session');
  await session.remove();
  logger.debug('Removed session');

  logger.info('Successfully removed session by id');

  res.status(200).json({
    errors: false,
    message: lang.killedSessionById,
  });
};
