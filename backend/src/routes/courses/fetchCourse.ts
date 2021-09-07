/** @format */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
const fetchCourseRouter = Router();
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '../../library';

import { authenticate } from '../../middlewares/authenticate';
import { getLanguage } from '../../middlewares/getLanguage';

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
  getLanguage,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const lang = LANG[`${req.lang}`];

    logger.debug('Starting course fetch');

    if (!currentUser) {
      logger.debug('User trying to fetch courses is not logged in');
      throw new NotAuthorizedError(lang.pleaseLogin);
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
      throw new BadRequestError(lang.accountNotFound);
    }

    if (user.courses.length === 0) {
      logger.debug('No courses found for user');
      // throw new BadRequestError('No courses found');
    }

    logger.info('Returning courses to user');
    res.status(200).json({
      errors: false,
      msg: lang.foundCourses,
      courses: user.courses,
    });
  },
);

fetchCourseRouter.get(
  '/api/course/:courseId',
  authenticate,
  getLanguage,
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const currentUser = req.currentUser;

    const lang = LANG[`${req.lang}`];

    logger.info('Trying to fetch course');
    if (!currentUser) {
      logger.debug('User is not authenticated');
      throw new NotAuthorizedError(lang.pleaseLogin);
    }

    logger.debug('Checking if id is a valid ObjectId');
    if (!mongoose.isValidObjectId(courseId)) {
      logger.debug('Id is not a valid ObjectId');
      throw new NotFoundError(lang.notFound);
    }

    logger.debug('Fetching course');
    const course = await Course.findById(courseId)
      .populate({
        path: 'coursePage',
        populate: {
          path: 'phases',
        },
      })
      .populate({ path: 'owner', select: 'name' });

    if (!course) {
      logger.debug('No course found');
      throw new NotFoundError(lang.notFound);
    }

    logger.debug('Checking if user has access to course');
    if (
      // @ts-ignore
      !course.students?.includes(currentUser.id) &&
      // @ts-ignore
      course.owner.id.toString() !== currentUser.id.toString()
    ) {
      logger.debug("User doesn't have access to course");
      throw new NotAuthorizedError(lang.noAccessToCourse);
    }

    logger.info('Successfully fetched course. Returning to user');
    res.status(200).json({
      errors: false,
      msg: lang.foundCourse,
      course,
    });
  },
);

export default fetchCourseRouter;
