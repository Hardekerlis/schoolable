/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
const createCourseRouter = Router();
import { validateRequest, BadRequestError } from '../../library';

import { authenticate } from '../../middlewares/authenticate';
import { checkUserType } from '../../middlewares/checkUserType';

import { logger } from '../../logger/logger';

import { Action, ActionTypes } from '../../library';

/*
  TODO
  Add course menu items
*/

import Course from '../../models/course';
import CoursePage, { CoursePageDoc } from '../../models/coursePage';
import User, { UserDoc } from '../../models/user';

createCourseRouter.post(
  '/api/course/create',
  authenticate,
  checkUserType(['teacher', 'admin']), // Check if the user is allowed to do this
  [
    body('name')
      .exists()
      .isString()
      .withMessage('Please supply a name for the course'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const ownerId = req.currentUser?.id;

    const owner = await User.findById(ownerId); // Find teacher or admin from id contained in cookie

    if (!owner) {
      throw new BadRequestError('No user with the supplied id was found');
    }

    const overviewAction: Action = {
      type: ActionTypes.LeftClick,
      goTo: 'this.overview',
    };

    const coursePage = CoursePage.build({
      description: '',
      menu: [
        {
          title: 'Overview',
          access: ['all'],
          actions: [
            {
              type: ActionTypes.LeftClick,
              goTo: 'this.overview',
            },
          ],
          removeable: false,
        },
        {
          title: 'asffffffffffffffffffffffff',
          access: ['all'],
          actions: [
            {
              type: ActionTypes.LeftClick,
              goTo: 'this.overview',
            },
          ],
          removeable: false,
        },
        {
          title: 'asdasdasda',
          access: ['all'],
          actions: [
            {
              type: ActionTypes.LeftClick,
              goTo: 'this.overview',
            },
          ],
          removeable: false,
        },
        {
          title: 'as',
          access: ['all'],
          actions: [
            {
              type: ActionTypes.LeftClick,
              goTo: 'this.overview',
            },
          ],
          removeable: false,
        },
      ],
    });

    try {
      // @ts-ignore
      console.log(coursePage.menu[0].actions);
      await coursePage.save(); // Create a course page

      const course = Course.build({
        // Create a course
        name: name as string,
        owner: owner as UserDoc,
        coursePage: coursePage as CoursePageDoc, // Save coursePage to course
      });

      await course.save();

      owner.courses.push(course.id); // Add course to the teacher owning the course
      await owner.save();

      res.status(201).json({
        errors: false,
        msg: 'created a new course',
        course, // Return the course to the user so it can be "loaded" on frontend
        owner: owner.name,
      });
    } catch (err) {
      console.error(err);
      logger.error(
        `Ran into an error while trying to save coursePage. Error message: ${err}`,
      );
    }
  },
);

export default createCourseRouter;
