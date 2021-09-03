/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, UserTypes, LANG } from '../library';

import { logger } from '../logger/logger';

export const checkUserType = (allowedUserType: string[]) => {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const lang = req.currentUser.lang;

      const userType = req.currentUser?.userType;

      logger.info('Checking user type');

      if (!userType) {
        throw new NotAuthorizedError(LANG[lang].pleaseLogin);
      }

      let isAllowed = false; // is true if users usertype is in allowedUserType array
      for (const i of allowedUserType) {
        if (i === userType) {
          isAllowed = true;
          break;
        }
      }

      if (isAllowed) {
        next();
      } else {
        res.status(401).json({
          errors: true,
          msg: LANG[lang].noAccess,
        });
      }
    } catch (err) {
      logger.error(`Ran into an unexpected error. Error msg: ${err}`);
      res.status(500).send();
    }
  };
};
