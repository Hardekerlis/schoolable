/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, CONFIG, BadRequestError } from '@schoolable/common';
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
  [],
  validateRequest,
  async (req: Request, res: Response) => {
    res.json({
      users: [],
    });
  },
);

export default fetchUsersRouter;
