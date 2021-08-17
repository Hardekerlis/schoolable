/** @format */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
const removeCourseRouter = Router();
import {
  BadRequestError,
  NotAuthorizedError,
  UserTypes,
} from '@schoolable/common';

import { authenticate } from '../../middlewares/authenticate';
import { checkUserType } from '../../middlewares/checkUserType';

import { logger } from '../../logger/logger';

import removeCourse from '../../utils/course/removeCourse';

/*
  TODO
  Add course menu items
*/

import User from '../../models/user';
import Course from '../../models/course';

removeCourseRouter.delete(
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
  async (req: Request, res: Response) => {
    const { id } = req.body;
    const currentUser = req.currentUser;

    if (!currentUser) {
      // If user isn't logged in
      throw new BadRequestError('Please login before you do that');
    }

    const owner = await User.findById(currentUser.id);

    if (!owner) {
      // Check if user exists
      throw new BadRequestError('Please login before you do that');
    }

    // If user doesn't own any courses
    if (owner.courses.length === 0) {
      throw new BadRequestError("You don't have any courses");
    }

    const courseToRemove = await Course.findById(id);

    if (!courseToRemove) {
      throw new BadRequestError('No course with that id was found');
    }

    // To string becuase ObjectIds can't be compared becuase they are objects
    if (courseToRemove.owner.toString() !== owner.id.toString()) {
      throw new NotAuthorizedError("You don't own this course");
    }

    // Call 4th tier in removal call chain
    // Removes all subdocs of course
    const removalRes = await removeCourse(courseToRemove);

    if (removalRes.error === true) {
      throw new Error('Unexpected error');
    }

    res.status(200).json({
      error: false,
      msg: 'Succesfully removed course and all of its children',
      upForDeletion: removalRes.upForDeletion,
    });
  },
);

export default removeCourseRouter;
