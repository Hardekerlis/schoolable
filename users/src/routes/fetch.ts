import { Request, Response } from 'express';
import url from 'url';
import {
  LANG,
  UserTypes,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-common';

import User from '../models/user';

const fetch = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const { usertype } = url.parse(req.url, true).query;

  if (
    usertype === UserTypes.Student &&
    currentUser?.userType === UserTypes.Student
  ) {
    throw new NotAuthorizedError();
  }

  const users = await User.find({ userType: usertype as UserTypes });

  res.status(200).json({
    errors: false,
    message: lang.foundUsers,
    users,
  });
};

export default fetch;
