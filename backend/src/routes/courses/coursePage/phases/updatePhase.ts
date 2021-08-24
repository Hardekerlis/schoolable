/** @format */

import { Router, Request, Response } from 'express';
const updatePhaseRouter = Router();
import mongoose from 'mongoose';

import { authenticate } from '../../../../middlewares/authenticate';
import { checkUserType } from '../../../../middlewares/checkUserType';

import {
  UserTypes,
  NotAuthorizedError,
  BadRequestError,
  NotFoundError,
} from '../../../../library';

import Course from '../../../../models/course';
import Phase from '../../../../models/phase';

import { logger } from '../../../../logger/logger';

updatePhaseRouter.put(
  '/api/course/:courseId/:phaseId',
  authenticate,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;

    logger.info('Trying to update phase');

    if (!currentUser) {
      logger.debug('User is not authenticated');
      throw new NotAuthorizedError('Please login before you do that');
    }

    const { courseId, phaseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      logger.debug('courseId is not an ObjectId');
      throw new BadRequestError('The course id in URI is not a valid ObjectId');
    }

    if (!mongoose.isValidObjectId(phaseId)) {
      logger.debug('phaseId is not an ObjectId');
      throw new BadRequestError('The phase id in URI is not a valid ObjectId');
    }

    logger.debug('Looking up course');
    const course = await Course.findById(courseId);

    if (!course) {
      logger.debug('Course found');
      throw new NotFoundError('No course with that id found');
    }

    if (course.owner.toString() !== currentUser.id.toString()) {
      logger.debug("User trying to update phase doesn't own course");
      throw new NotAuthorizedError(
        'You are no authorized to make any changes to this resource',
      );
    }

    const data = req.body;

    logger.debug('Looking up phase');
    const phase = await Phase.findByIdAndUpdate(phaseId, data, { new: true });

    if (!phase) {
      logger.debug('No phase with the supplied id found in database');
      throw new NotFoundError('No phase with that id found');
    }

    logger.info('Successfully updated phase');
    res.status(200).json({
      errors: false,
      msg: 'Successfully updated phase',
      phase,
    });
  },
);

export default updatePhaseRouter;
