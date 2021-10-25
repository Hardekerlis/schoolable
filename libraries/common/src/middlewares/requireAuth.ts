/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../';
import { UserTypes } from '../';

export const requireAuth = (allowedUserType: UserTypes[] | string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
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

    if (
      Object.values(UserTypes).includes(currentUser!.userType) &&
      allowedUserType === 'all'
    ) {
      isAllowed = true;
    }

    if (isAllowed) {
      next();
    } else {
      throw new NotAuthorizedError();
    }
  };
};
