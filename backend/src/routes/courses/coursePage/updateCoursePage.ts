/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
const updateCoursePageRouter = Router();

import { authenticate } from '../../../middlewares/authenticate';
import { checkUserType } from '../../../middlewares/checkUserType';
import {
  UserTypes,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
} from '../../../library';
import Course from '../../../models/course';
import CoursePage from '../../../models/coursePage';

updateCoursePageRouter.put(
  '/api/coursePage',
  authenticate,
  checkUserType([UserTypes.Admin, UserTypes.Teacher]),
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
    const data = req.body;
    const currentUser = req.currentUser;
    const courseId = data.id;
    delete data.id;

    if (!currentUser) {
      throw new NotAuthorizedError('Please login before you do that');
    }

    const course = await Course.findById(courseId)
      .populate('coursePage')
      .populate({ path: 'owner', select: 'id' });

    if (!course) {
      throw new BadRequestError('No course with that id was found');
    }

    if (currentUser.id !== course.owner.id) {
      throw new NotAuthorizedError(
        'You are no authorized to make any changes to this resource',
      );
    }

    const updatedCoursePage = await CoursePage.findByIdAndUpdate(
      course.coursePage.id,
      data,
      { new: true },
    );

    res.status(200).json({
      errors: false,
      msg: 'Successfully updated coursePage',
      coursePage: updatedCoursePage,
    });
  },
);

export default updateCoursePageRouter;
