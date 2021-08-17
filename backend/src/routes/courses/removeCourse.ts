/** @format */

import { Router, Request, Response } from 'express';
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
  async (req: Request, res: Response) => {
    // const { currentUser } = req;
    //
    // if (!currentUser) {
    //   throw new NotAuthorizedError('Please login before you do that');
    // }
    //
    // const owner = await User.findById(currentUser.id);
    //
    // if (!owner) {
    //   throw new BadRequestError('No user with that user id exists');
    // }

    const { id } = req.body;
    const currentUser = req.currentUser;

    if (!currentUser) {
      throw new BadRequestError('Please login before you do that');
    }

    const owner = await User.findById(currentUser.id);

    if (!owner) {
      throw new BadRequestError('Please login before you do that');
    }

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
