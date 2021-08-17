/** @format */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';

const removeCourseRouter = Router();
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
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
    const currentUser = req.currentUser;

    // Check if token is valid
    if (!currentUser) {
      throw new NotAuthorizedError('Please login before you do that');
    }

    const owner = await User.findById(currentUser.id);

    if (!owner) {
      // Just in case token check above fails
      throw new BadRequestError('No user with that id found');
    }

    const data = req.body;
    const courseId = data.id;
    delete data.id;

    // Check if user owns the course it is trying to edit
    if (!owner.courses.includes(courseId.toString())) {
      throw new NotAuthorizedError(
        "You don't own the course you are trying to edit",
      );
    }

    // find course and update
    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
    });

    // Check if course was found and updated
    if (!updatedCourse) {
      throw new BadRequestError('No course with that id found');
    }

    res.status(200).json({
      errors: false,
      msg: 'Successfully updated course',
      course: updatedCourse,
    });
  },
);

export default removeCourseRouter;
