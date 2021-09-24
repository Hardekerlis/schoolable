/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';
import { UserTypes } from '@gustafdahl/schoolable-enums';

export const requireAuth = (allowedUserType: UserTypes[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    const { userType } = req.currentUser;

    let isAllowed = false;
    for (const i of allowedUserType) {
      if (i === userType) {
        isAllowed = true;
        break;
      }
    }

    if (isAllowed) {
      next();
    } else {
      throw new NotAuthorizedError();
    }
  };
};