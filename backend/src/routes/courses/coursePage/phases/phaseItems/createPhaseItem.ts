/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

const createPhaseItemRouter = Router();

import { authenticate } from '../../../../../middlewares/authenticate';
import { getLanguage } from '../../../../../middlewares/getLanguage';
import { checkUserType } from '../../../../../middlewares/checkUserType';

import {
  UserTypes,
  validateRequest,
  NotAuthorizedError,
  BadRequestError,
  LANG,
} from '../../../../../library';

import Phase from '../../../../../models/phase';
import Course from '../../../../../models/course';
import PhaseItem from '../../../../../models/phaseItem';

import { logger } from '../../../../../logger/logger';

createPhaseItemRouter.post(
  '/api/course/:courseId/:phaseId/createPhaseItem',
  authenticate,
  getLanguage,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  [
    body('name')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        const { lang } = req;

        return LANG[lang].nameMustBeString;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;
    const { lang } = req;

    if (!currentUser) {
      throw new NotAuthorizedError(LANG[lang].pleaseLogin);
    }

    const { courseId, phaseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      throw new BadRequestError(LANG[lang].notValidObjectId);
    }

    if (!mongoose.isValidObjectId(phaseId)) {
      throw new BadRequestError(LANG[lang].phaseIdIsNotValidObjectId);
    }

    const course = await Course.findById(courseId).populate({
      path: 'coursePage',
      select: 'phases',
    });

    if (!course) {
      throw new BadRequestError(LANG[lang].noCourseWithId);
    }

    if (course.owner.toString() !== currentUser.id.toString()) {
      throw new NotAuthorizedError(LANG[lang].notAllowedToCreatePhaseItem);
    }

    // @ts-ignore
    if (course.coursePage.phases.length === 0) {
      throw new BadRequestError(LANG[lang].noPhaseInCourse);
    }

    // @ts-ignore
    if (!course.coursePage.phases.toString().includes(phaseId)) {
      throw new BadRequestError(LANG[lang].specifiedPhaseDoesntBelongToCourse);
    }

    const phase = await Phase.findById(phaseId);

    if (!phase) {
      throw new BadRequestError(LANG[lang].noPhaseWithId);
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
        msg: LANG[lang].createdPhaseItem,
        phaseItem: phaseItem,
      });
    } catch (err) {
      logger.error(`Ran into an unexpected error. Error message: ${err}`);
      throw new Error(LANG[lang].unexpectedError);
    }
  },
);

export default createPhaseItemRouter;
