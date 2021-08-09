/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, UserTypes } from '@schoolable/common';
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
  const token = req.session?.jwt;

  logger.info('Authenticating user');

  if (!token) {
    throw new NotAuthorizedError('Please login before you do that');
  }

  try {
    const payload = jwt.verify(
      token as string,
      process.env.JWT_KEY as string,
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {
    console.log(err);
    logger.warn(
      `Encountered an error while trying to verfiy a json webtoken. Error message: ${err}`,
    );

    res.status(500).json({
      msg: 'The server ran into an unexpected error',
    });
  }

  next();
};
