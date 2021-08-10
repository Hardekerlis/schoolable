/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, UserTypes } from '@schoolable/common';

import { logger } from '../logger/logger';

export const checkUserType = (allowedUserType: string[]) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const userType = req.currentUser?.userType;

    logger.info('Checking user type');

    if (!userType) {
      throw new NotAuthorizedError('Please login before you do that');
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
        error: true,
        msg: "You don't have access to that",
      });
    }
  };
};
