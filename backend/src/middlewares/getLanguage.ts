/** @format */

import { Request, Response, NextFunction } from 'express';

import { BadRequestError } from '../library';

declare global {
  namespace Express {
    interface Request {
      lang: string;
    }
  }
}

export const getLanguage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let lang: string;
  const currentUser = req.currentUser;
  if (!currentUser) {
    lang = req.cookies.lang ? req.cookies.lang : req.signedCookies.lang;
  } else {
    lang = currentUser.lang;
  }

  if (!lang) lang = 'ENG';

  req.lang = lang;

  next();
};
