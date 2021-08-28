/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

const createPhaseItemRouter = Router();

import { authenticate } from '../../../../../middlewares/authenticate';
import { checkUserType } from '../../../../../middlewares/checkUserType';

import {
  UserTypes,
  validateRequest,
  NotAuthorizedError,
  BadRequestError,
} from '../../../../../library';

import Phase from '../../../../../models/phase';
import Course from '../../../../../models/course';
import PhaseItem from '../../../../../models/phaseItem';

import { logger } from '../../../../../logger/logger';

createPhaseItemRouter.post(
  '/api/course/:courseId/:phaseId/createPhaseItem',
  authenticate,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  [body('name').exists().isString().withMessage('Name has to be a string')],
  validateRequest,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;

    if (!currentUser) {
      throw new NotAuthorizedError('Please login before you do that');
    }

    const { courseId, phaseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      throw new BadRequestError(
        'The supplied course id is not a valid ObjectId',
      );
    }

    if (!mongoose.isValidObjectId(phaseId)) {
      throw new BadRequestError(
        'The supplied phase id is not a valid ObjectId',
      );
    }

    const course = await Course.findById(courseId).populate({
      path: 'coursePage',
      select: 'phases',
    });

    if (!course) {
      throw new BadRequestError('No course with that id found');
    }

    if (course.owner.toString() !== currentUser.id.toString()) {
      throw new NotAuthorizedError(
        'You are not allowed to create phaseItems for this course',
      );
    }

    // @ts-ignore
    if (course.coursePage.phases.length === 0) {
      throw new BadRequestError('No phases exists in this course');
    }

    // @ts-ignore
    if (!course.coursePage.phases.toString().includes(phaseId)) {
      throw new BadRequestError(
        "The specified phase doesn't belong to the course",
      );
    }

    const phase = await Phase.findById(phaseId);

    if (!phase) {
      throw new BadRequestError('No phase with that id found');
    }

    const phaseItem = PhaseItem.build({
      name: req.body.name,
    });

    if (phase.phaseItems?.length === 0) {
      phase.phaseItems = [phaseItem];
    } else {
      // @ts-ignore
      phase.phaseItems.push(phaseItem);
    }

    try {
      await phase.save();

      await phaseItem.save();

      res.status(201).json({
        errors: false,
        msg: 'Successfully created phaseItem',
        phaseItem: phaseItem,
      });
    } catch (err) {
      logger.error(`Ran into an unexpected error. Error message: ${err}`);
    }
  },
);

export default createPhaseItemRouter;
