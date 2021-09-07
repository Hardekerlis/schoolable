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
  LANG,
} from '../../library';

import { authenticate } from '../../middlewares/authenticate';
import { getLanguage } from '../../middlewares/getLanguage';
import { checkUserType } from '../../middlewares/checkUserType';

import { logger } from '../../logger/logger';

import User from '../../models/user';
import Course from '../../models/course';

// TODO: Add logger to updateCourse

removeCourseRouter.put(
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
  validateRequest,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;
    const lang = LANG[`${req.lang}`];

    // Check if token is valid
    if (!currentUser) {
      throw new NotAuthorizedError(lang.pleaseLogin);
    }

    const owner = await User.findById(currentUser.id);

    if (!owner) {
      // Just in case token check above fails
      throw new BadRequestError(lang.noUserWithId);
    }

    const data = req.body;
    const courseId = data.id;
    delete data.id;

    // Check if user owns the course it is trying to edit
    if (!owner.courses.includes(courseId.toString())) {
      throw new NotAuthorizedError(lang.notAuthorizedToChangeResource);
    }

    // find course and update
    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
    });

    // Check if course was found and updated
    if (!updatedCourse) {
      throw new BadRequestError(lang.noCourseWithId);
    }

    res.status(200).json({
      errors: false,
      msg: lang.updatedCourse,
      course: updatedCourse,
    });
  },
);

export default removeCourseRouter;
