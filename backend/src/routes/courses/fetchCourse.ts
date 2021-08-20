/** @format */

import { Router, Request, Response } from 'express';
const fetchCourseRouter = Router();
import { BadRequestError, NotAuthorizedError } from '../../library';

import { authenticate } from '../../middlewares/authenticate';

import { logger } from '../../logger/logger';

/*
  TODO
  Add course menu items
*/

import User from '../../models/user';

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
    const user = await User.findById(currentUser.id).populate('courses');

    if (!user) {
      logger.debug('No user found with the id supplied in cookie');
      throw new BadRequestError('No user found');
    }

    if (user.courses.length === 0) {
      logger.debug('No courses found for user');
      res.status(404).json({
        errors: false,
        msg: 'No courses found',
        courses: [],
      });
    }

    logger.info('Returning courses to user');
    res.status(200).json({
      errors: false,
      msg: 'Found courses',
      courses: user.courses,
    });
  },
);

export default fetchCourseRouter;
