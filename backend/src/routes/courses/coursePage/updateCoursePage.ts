/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
const updateCoursePageRouter = Router();

import { authenticate } from '../../../middlewares/authenticate';
import { getLanguage } from '../../../middlewares/getLanguage';
import { checkUserType } from '../../../middlewares/checkUserType';
import {
  UserTypes,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '../../../library';
import Course from '../../../models/course';
import CoursePage from '../../../models/coursePage';

updateCoursePageRouter.put(
  '/api/coursePage',
  authenticate,
  getLanguage,
  checkUserType([UserTypes.Admin, UserTypes.Teacher]),
  [
    body('id')
      .exists()
      .custom((value, { req }) => {
        // Check if id is a valid MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          const lang = LANG[`${req.lang}`];
          throw new BadRequestError(lang.courseIdNotValidObjectId);
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const data = req.body;
    const currentUser = req.currentUser;
    const courseId = data.id;
    delete data.id;

    const lang = LANG[`${req.lang}`];

    if (!currentUser) {
      throw new NotAuthorizedError(lang.pleaseLogin);
    }

    const course = await Course.findById(courseId)
      .populate('coursePage')
      .populate({ path: 'owner', select: 'id' });

    if (!course) {
      throw new BadRequestError(lang.noCourseWithId);
    }

    if (currentUser.id !== course.owner.id) {
      throw new NotAuthorizedError(lang.notAuthorizedToChangeResource);
    }

    const updatedCoursePage = await CoursePage.findByIdAndUpdate(
      course.coursePage.id,
      data,
      { new: true },
    );

    res.status(200).json({
      errors: false,
      msg: lang.updatedCoursePage,
      coursePage: updatedCoursePage,
    });
  },
);

export default updateCoursePageRouter;
