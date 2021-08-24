/** @format */

import { Router, Request, Response } from 'express';
const createPhaseRouter = Router();
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { authenticate } from '../../../../middlewares/authenticate';
import { checkUserType } from '../../../../middlewares/checkUserType';

import {
  UserTypes,
  validateRequest,
  NotAuthorizedError,
  BadRequestError,
  NotFoundError,
} from '../../../../library';

import Course from '../../../../models/course';
import Phase from '../../../../models/phase';

import { logger } from '../../../../logger/logger';

createPhaseRouter.post(
  '/api/course/:courseId/createPhase',
  authenticate,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  [body('name').isString().withMessage('Please supply a name for this phase')],
  validateRequest,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;

    logger.info('Starting creation of phase');

    if (!currentUser) {
      logger.debug('User is not signed in');
      throw new NotAuthorizedError('Please login before you do that');
    }

    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      logger.debug('User supplied an invalid ObjectId');
      throw new BadRequestError('The course id in URI is not a valid ObjectId');
    }

    logger.info('Fetching course and populating coursePage');
    const course = await Course.findById(courseId).populate('coursePage');

    if (!course) {
      logger.debug('No course was found');
      throw new NotFoundError();
    }

    logger.debug(
      'Checking if user is owner of course and is allowed to create a phase for this course',
    );
    if (course.owner.toString() !== currentUser.id.toString()) {
      logger.debug('User was is not allowed to create a phase for this course');
      throw new NotAuthorizedError(
        "You don't have access to create resources for this course",
      );
    }

    logger.debug('Building phase');
    const phase = Phase.build({
      name: req.body.name,
    });

    logger.debug('Pushing phase to coursePage doc');
    // @ts-ignore
    course.coursePage.phases.push(phase);

    try {
      logger.debug('Saving phase');
      await phase.save();

      logger.debug('Saving coursePage');
      await course.coursePage.save();

      logger.info('Successfully created phase');
      res.status(201).json({
        errors: false,
        msg: 'Successfully created a phaes',
        phase: phase,
      });
    } catch (err) {
      logger.error(`Ran into an unexpected error. Error message: ${err}`);
    }
  },
);

export default createPhaseRouter;
