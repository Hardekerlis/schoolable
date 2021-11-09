import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  LANG,
  UserTypes,
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

export default router;
