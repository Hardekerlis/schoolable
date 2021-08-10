/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import User from '../../../models/user';

import { logger } from '../../../logger/logger';

const fetchUsersRouter = Router();

// TODO
// Remove hardcoded text

fetchUsersRouter.post(
  '/api/admin/users',
  async (req: Request, res: Response) => {
    let { query, sortAfter, skipNumber } = req.body;

    let search: any = { $text: { $search: query } };

    if (!sortAfter) sortAfter = 'name';
    if (!query) search = {};
    if (!skipNumber) skipNumber = 0;
    logger.info(`Fetching users. Query: ${query}`);
    let users = await User.find(search)
      .sort(sortAfter) // sort after for example userTypes, add a - before like: -userTypes to reverse sort
      .skip(skipNumber) // What index to start fetching from
      .limit(skipNumber + 50); // How many users should be fetched

    if (users.length === 0) {
      logger.info('No users found');
      res.status(404).json({ msg: 'No users found' });
    }

    logger.info(`Found ${users.length} users`);
    res.json({ msg: 'Users found', users });
  },
);

export default fetchUsersRouter;
