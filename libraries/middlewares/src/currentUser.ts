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
  let { token } = req.cookies.token ? req.cookies : req.signedCookies;

  if (!token) token = req.body.token;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_KEY as string,
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}

  next();
};
