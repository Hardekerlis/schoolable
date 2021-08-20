/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, UserTypes } from '../library';
import jwt from 'jsonwebtoken';

import { logger } from '../logger/logger';
import Session from '../models/session';

export interface UserPayload {
  email: string;
  id: string;
  userType: UserTypes;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Get cookie from session
  let { sessionId } = req.cookies || req.signedCookies;
  logger.info('Authenticating user');
  // Check if token is defined
  if (!sessionId) sessionId = req.body.sessionId;
  if (!sessionId) {
    logger.info("User doesn't have session cookie");
    logger.info('Authentication failed');
    throw new NotAuthorizedError('Please login before you do that');
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    logger.info(
      'No session with the session id contained in the cookie was found',
    );
    logger.info('Authentication failed');
    throw new NotAuthorizedError(
      'Session was not found. Please login before you do that',
    );
  }

  const token = session.value;

  try {
    // Decode jwt key and verify it is valid
    const payload = jwt.verify(
      token as string,
      process.env.JWT_KEY as string,
    ) as UserPayload;

    // Assign payload to req
    req.currentUser = payload;
    logger.info('Successfully authenticated user');
  } catch (err) {
    logger.warn(
      `Encountered an error while trying to verfiy a json webtoken. Error message: ${err}`,
    );
    logger.info('Authentication failed');
  }
  next();
};
