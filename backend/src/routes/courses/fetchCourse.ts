/** @format */

import { Router, Request, Response } from 'express';
const fetchCourseRouter = Router();
import { BadRequestError, NotAuthorizedError } from '@schoolable/common';

import { authenticate } from '../../middlewares/authenticate';

import { logger } from '../../logger/logger';

/*
  TODO
  Add course menu items
*/

import Course from '../../models/course';
import User from '../../models/user';

fetchCourseRouter.get(
  '/api/course',
  authenticate,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    if (!currentUser) {
      throw new NotAuthorizedError('Please login before you do that');
    }

    const user = await User.findById(currentUser.id).populate('courses');

    if (!user) {
      throw new BadRequestError('No user found');
    }

    if (user.courses.length === 0) {
      res.status(404).json({
        error: false,
        msg: 'No courses found',
        courses: [],
      });
    }

    res.status(200).json({
      error: false,
      msg: 'Found courses',
      courses: user.courses,
    });
  },
);

export default fetchCourseRouter;
