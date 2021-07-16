/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import User from '../../models/user';

import { logger } from '../../logger/logger';
import { authenticate } from '../../middlewares/authenticate';

const fetchUsersRouter = Router();

// TODO
// Remove hardcoded text

fetchUsersRouter.post(
  '/api/users',
  authenticate,
  async (req: Request, res: Response) => {
    let { query, sortAfter, skipNumber } = req.body;

    let search: any = { $text: { $search: query } };

    if (!sortAfter) sortAfter = 'name';
    if (!query) search = {};
    if (!skipNumber) skipNumber = 0;

    let users = await User.find(search)
      .sort(sortAfter) // sort after tex userTypes, add a - before like: -userTypes to reverse sort
      .skip(skipNumber)
      .limit(skipNumber + 50);

    if (users.length === 0) res.status(404).json({ msg: 'No users found' });

    res.json({ msg: 'Users found', users });
  },
);

export default fetchUsersRouter;
