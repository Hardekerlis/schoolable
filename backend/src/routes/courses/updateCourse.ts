/** @format */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';

const removeCourseRouter = Router();
import {
  BadRequestError,
  NotAuthorizedError,
  UserTypes,
  validateRequest,
} from '@schoolable/common';

import { authenticate } from '../../middlewares/authenticate';
import { checkUserType } from '../../middlewares/checkUserType';

import { logger } from '../../logger/logger';

import User from '../../models/user';
import Course from '../../models/course';

removeCourseRouter.patch(
  '/api/course',
  authenticate,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  [
    body('id')
      .exists()
      .custom((value) => {
        // Check if id is a valid MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          throw new BadRequestError('The id supplied is not a valid ObjectId');
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // How to do input validation
    const data = req.body;

    console.log(data);
    res.status(500).send();
  },
);

export default removeCourseRouter;
