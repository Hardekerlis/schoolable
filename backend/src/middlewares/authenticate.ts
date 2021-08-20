/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, UserTypes } from '../library';
import jwt from 'jsonwebtoken';

import { logger } from '../logger/logger';

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

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Get cookie from session
  const cookies = req.cookies || req.signedCookies;
  logger.info('Authenticating user');
  // Check if token is defined
  if (!cookies) {
    throw new NotAuthorizedError('Please login before you do that');
  }

  try {
    // Decode jwt key and verify it is valid
    const payload = jwt.verify(
      cookies as string,
      process.env.JWT_KEY as string,
    ) as UserPayload;

    // Assign payload to req
    req.currentUser = payload;
  } catch (err) {
    logger.warn(
      `Encountered an error while trying to verfiy a json webtoken. Error message: ${err}`,
    );
  }
  next();
};
