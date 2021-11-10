import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  LANG,
  UserTypes,
  HandInTypes,
} from '@gustafdahl/schoolable-common';
import { body, query, param } from 'express-validator';

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

import fetch from './fetch';
router.get(
  '/fetch',
  currentUser,
  getLanguage,
  requireAuth('all'),
  [
    query('module_id')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needModuleId;
      }),
  ],
  validateResult,
  fetch.many,
);

router.get(
  '/fetch/:phaseId',
  currentUser,
  currentUser,
  getLanguage,
  requireAuth('all'),
  fetch.one,
);

import update from './update';
router.put(
  '/update',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('phaseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseId;
      }),

    body('name')
      .optional()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needString;
      }),
    body('description')
      .optional()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needString;
      }),

    body('page.handInTypes')
      .optional()
      .custom((value, { req }) => {
        if (!Object.values(HandInTypes).includes(value)) {
          throw new Error(LANG[`${req.lang}`].needHandInTypes);
        }

        return value;
      }),
  ],
  validateResult,
  update,
);

export default router;
