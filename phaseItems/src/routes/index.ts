import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
} from '@gustafdahl/schoolable-middlewares';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { body } from 'express-validator';
import mongoose from 'mongoose';

const router = Router();

import create from './create';
router.post(
  '/create',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('name')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needName;
      }),
    body('phaseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseId;
      }),
    body('parentCourse')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needParentCourse;
      }),
  ],
  validateResult,
  create,
);

export default router;
