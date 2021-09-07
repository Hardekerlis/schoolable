/** @format */

import { Router, Request, Response } from 'express';
const updatePhaseRouter = Router();
import mongoose from 'mongoose';

import { authenticate } from '../../../../middlewares/authenticate';
import { getLanguage } from '../../../../middlewares/getLanguage';
import { checkUserType } from '../../../../middlewares/checkUserType';

import {
  UserTypes,
  NotAuthorizedError,
  BadRequestError,
  NotFoundError,
  LANG,
} from '../../../../library';

import Course from '../../../../models/course';
import Phase from '../../../../models/phase';

import { logger } from '../../../../logger/logger';

updatePhaseRouter.put(
  '/api/course/:courseId/:phaseId',
  authenticate,
  getLanguage,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;
    const lang = LANG[`${req.lang}`];

    logger.info('Trying to update phase');

    if (!currentUser) {
      logger.debug('User is not authenticated');
      throw new NotAuthorizedError(lang.pleaseLogin);
    }

    const { courseId, phaseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      logger.debug('courseId is not an ObjectId');
      throw new BadRequestError(lang.courseIdNotValidObjectId);
    }

    if (!mongoose.isValidObjectId(phaseId)) {
      logger.debug('phaseId is not an ObjectId');
      throw new BadRequestError(lang.phaseIdIsNotValidObjectId);
    }

    logger.debug('Looking up course');
    const course = await Course.findById(courseId);

    if (!course) {
      logger.debug('Course found');
      throw new NotFoundError(lang.noCourseWithId);
    }

    if (course.owner.toString() !== currentUser.id.toString()) {
      logger.debug("User trying to update phase doesn't own course");
      throw new NotAuthorizedError(lang.notAuthorizedToChangeResource);
    }

    const data = req.body;

    logger.debug('Looking up phase');
    const phase = await Phase.findByIdAndUpdate(phaseId, data, { new: true });

    if (!phase) {
      logger.debug('No phase with the supplied id found in database');
      throw new NotFoundError(lang.noPhaseWithId);
    }

    logger.info('Successfully updated phase');
    res.status(200).json({
      errors: false,
      msg: lang.updatedPhase,
      phase,
    });
  },
);

export default updatePhaseRouter;
