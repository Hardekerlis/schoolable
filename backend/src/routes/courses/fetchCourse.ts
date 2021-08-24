/** @format */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
const fetchCourseRouter = Router();
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from '../../library';

import { authenticate } from '../../middlewares/authenticate';

import { logger } from '../../logger/logger';

/*
  TODO
  Add course menu items
*/

import User from '../../models/user';
import Course from '../../models/course';

fetchCourseRouter.get(
  '/api/course',
  authenticate,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    logger.debug('Starting course fetch');

    if (!currentUser) {
      logger.debug('User trying to fetch courses is not logged in');
      throw new NotAuthorizedError('Please login before you do that');
    }

    logger.info('Fetching user whom is trying to fetch courses');
    const user = await User.findById(currentUser.id).populate({
      path: 'courses',
      populate: {
        path: 'owner',
        model: 'users',
        select: 'name',
      },
    });

    if (!user) {
      logger.debug('No user found with the id supplied in cookie');
      throw new BadRequestError('No user found');
    }

    if (user.courses.length === 0) {
      logger.debug('No courses found for user');
      throw new BadRequestError('No courses found');
    }

    logger.info('Returning courses to user');
    res.status(200).json({
      errors: false,
      msg: 'Found courses',
      courses: user.courses,
    });
  },
);

fetchCourseRouter.get(
  '/api/course/:courseId',
  authenticate,
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const currentUser = req.currentUser;

    logger.info('Trying to fetch course');
    if (!currentUser) {
      logger.debug('User is not authenticated');
      throw new NotAuthorizedError('Please login before you do that');
    }

    logger.debug('Checking if id is a valid ObjectId');
    if (!mongoose.isValidObjectId(courseId)) {
      logger.debug('Id is not a valid ObjectId');
      throw new NotFoundError();
    }

    logger.debug('Fetching course');
    const course = await Course.findById(courseId)
      .populate('coursePage')
      .populate({ path: 'owner', select: 'name' });

    if (!course) {
      logger.debug('No course found');
      throw new NotFoundError();
    }

    logger.debug('Checking if user has access to course');
    if (
      // @ts-ignore
      !course.students?.includes(currentUser.id) &&
      // @ts-ignore
      course.owner.id.toString() !== currentUser.id.toString()
    ) {
      logger.debug("User doesn't have access to course");
      throw new NotAuthorizedError("You don't have access to this course");
    }

    logger.info('Successfully fetched course. Returning to user');
    res.status(200).json({
      errors: false,
      msg: 'Found course',
      course,
    });
  },
);

export default fetchCourseRouter;
