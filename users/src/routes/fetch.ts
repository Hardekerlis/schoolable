import { Request, Response } from 'express';
import url from 'url';
import {
  LANG,
  UserTypes,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-common';
import { validationResult } from 'express-validator';

import User from '../models/user';

import logger from '../utils/logger';

const fetch = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  logger.info('Starting to fetch users');

  logger.debug('Attempting to parse url query');
  const { usertype } = url.parse(req.url, true).query;

  logger.debug(`User type to be fetched is .. ${usertype}`);

  logger.debug('Checking if user is allowed to fetch user type');
  if (
    usertype === UserTypes.Student &&
    currentUser?.userType === UserTypes.Student
  ) {
    logger.debug('User is not allowed to fetch user type');
    throw new NotAuthorizedError();
  }

  logger.debug('User is allowed to fetch users');

  logger.debug('Looking up users in database');
  const users = await User.find({ userType: usertype as UserTypes });
  logger.debug('Looked up users');

  if (!users[0]) {
    return res.status(404).json({
      errors: false,
      message: lang.noUsersFound,
      users: [],
    });
  }

  res.status(200).json({
    errors: false,
    message: lang.foundUsers,
    users,
  });
};

export default fetch;
