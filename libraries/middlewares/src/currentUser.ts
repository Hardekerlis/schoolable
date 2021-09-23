/** @format */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { UserPayload } from '@gustafdahl/schoolable-interfaces';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.cookies?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_KEY as string,
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}

  next();
};
