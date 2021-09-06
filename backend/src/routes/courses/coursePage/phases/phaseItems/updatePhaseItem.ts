/** @format */

import { Request, Response, Router } from 'express';
const updatePhaseItemRouter = Router();

import mongoose from 'mongoose';

import { authenticate } from '../../../../../middlewares/authenticate';
import { getLanguage } from '../../../../../middlewares/getLanguage';
import { checkUserType } from '../../../../../middlewares/checkUserType';

import {
  UserTypes,
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '../../../../../library';

import Course from '../../../../../models/course';
import PhaseItem from '../../../../../models/phaseItem';

updatePhaseItemRouter.put(
  '/api/course/:courseId/:phaseId/:phaseItemId',
  authenticate,
  getLanguage,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;
    const { lang } = req;

    const _lang = LANG[lang];

    if (!currentUser) {
      throw new NotAuthorizedError(_lang.pleaseLogin);
    }

    const { courseId, phaseId, phaseItemId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      throw new BadRequestError(_lang.courseIdNotValidObjectId);
    }

    if (!mongoose.isValidObjectId(phaseId)) {
      throw new BadRequestError(_lang.phaseIdIsNotValidObjectId);
    }

    if (!mongoose.isValidObjectId(phaseItemId)) {
      throw new BadRequestError(_lang.phaseItemIdNotValidObjectId);
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
