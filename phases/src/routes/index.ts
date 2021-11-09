import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  LANG,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { body } from 'express-validator';

const router = Router();

import create from './create';
router.post(
  '/create',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher]),
  [
    body('name')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needName;
      }),
    body('parentModuleId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needModuleId;
      }),
  ],
  validateResult,
  create,
);

import remove from './remove';
router.delete(
  '/remove',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher]),
  [
    body('phaseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseId;
      }),
    body('parentModuleId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needModuleId;
      }),
  ],
  validateResult,
  remove,
);

export default router;
