/** @format */

import { Request, Response, Router } from 'express';
const updatePhaseItemRouter = Router();

import mongoose from 'mongoose';

import { authenticate } from '../../../../../middlewares/authenticate';
import { checkUserType } from '../../../../../middlewares/checkUserType';

import {
  UserTypes,
  BadRequestError,
  NotAuthorizedError,
} from '../../../../../library';

import Course from '../../../../../models/course';
import PhaseItem from '../../../../../models/phaseItem';

updatePhaseItemRouter.put(
  '/api/course/:courseId/:phaseId/:phaseItemId',
  authenticate,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;

    if (!currentUser) {
      throw new NotAuthorizedError('Please login before you do that');
    }

    const { courseId, phaseId, phaseItemId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      throw new BadRequestError('Course id is not valid');
    }

    if (!mongoose.isValidObjectId(phaseId)) {
      throw new BadRequestError('Phase id is not valid');
    }

    if (!mongoose.isValidObjectId(phaseItemId)) {
      throw new BadRequestError('PhaseItem id is not valid');
    }

    const course = await Course.findById(courseId);

    if (!course) {
      throw new BadRequestError('No course with the supplied id was found');
    }

    if (course.owner.toString() !== currentUser.id.toString()) {
      throw new NotAuthorizedError(
        'You are no authorized to make any changes to this resource',
      );
    }

    const phaseItem = await PhaseItem.findByIdAndUpdate(phaseItemId, req.body, {
      new: true,
    });

    if (!phaseItem) {
      throw new BadRequestError('No phaseItem with the supplied id was found');
    }

    res.status(200).json({
      errors: false,
      msg: 'Successfully updated phaseItem',
      phaseItem: phaseItem,
    });
  },
);

export default updatePhaseItemRouter;
