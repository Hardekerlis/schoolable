/** @format */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
const removeCourseRouter = Router();
import {
  BadRequestError,
  NotAuthorizedError,
  UserTypes,
  LANG,
} from '../../library';

import { authenticate } from '../../middlewares/authenticate';
import { getLanguage } from '../../middlewares/getLanguage';
import { checkUserType } from '../../middlewares/checkUserType';

import { logger } from '../../logger/logger';

import removeCourse from '../../utils/course/removeCourse';

/*
  TODO
  Add course menu items
*/

// TODO: add logger to remoce course

import User from '../../models/user';
import Course from '../../models/course';

removeCourseRouter.delete(
  '/api/course',
  authenticate,
  getLanguage,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  [
    body('id')
      .exists()
      .custom((value, { req }) => {
        // Check if id is a valid MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          throw new BadRequestError(LANG[`${req.lang}`].notValidObjectId);
        } else {
          return value;
        }
      }),
  ],
  async (req: Request, res: Response) => {
    const { id } = req.body;
    const currentUser = req.currentUser;
    const lang = LANG[`${req.lang}`];

    if (!currentUser) {
      // If user isn't logged in
      throw new BadRequestError(lang.pleaseLogin);
    }

    const owner = await User.findById(currentUser.id);

    if (!owner) {
      // Check if user exists
      throw new BadRequestError(lang.notAuthorized);
    }

    // If user doesn't own any courses
    if (owner.courses.length === 0) {
      throw new BadRequestError(lang.noCourseOwned);
    }

    const courseToRemove = await Course.findById(id);

    if (!courseToRemove) {
      throw new BadRequestError(lang.noCourseWithId);
    }

    // To string becuase ObjectIds can't be compared becuase they are objects
    if (courseToRemove.owner.toString() !== owner.id.toString()) {
      throw new NotAuthorizedError(lang.courseNotOwned);
    }

    // Call 4th tier in removal call chain
    // Removes all subdocs of course
    const removalRes = await removeCourse(courseToRemove);

    if (removalRes.error === true) {
      throw new Error(lang.unexpectedError);
    }

    res.status(200).json({
      errors: false,
      msg: lang.removedCourse,
      upForDeletion: removalRes.upForDeletion,
    });
  },
);

export default removeCourseRouter;
