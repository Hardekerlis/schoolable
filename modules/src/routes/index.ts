import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  UserTypes,
  LANG,
} from '@gustafdahl/schoolable-common';
import { body } from 'express-validator';

const router = Router();

import create from './create';
router.post(
  '/create',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  create,
);

import update from './update';
router.put(
  '/update',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('moduleId')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noModuleId;
      }),
    body('parentCourseId')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noParentCourseId;
      }),
  ],
  validateResult,
  update,
);

import remove from './remove';
router.delete(
  '/remove',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('moduleId')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noModuleId;
      }),
    body('parentCourseId')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noParentCourseId;
      }),
  ],
  validateResult,
  remove,
);

import { fetchMany, fetchOne } from './fetch';
router.post('/fetch', currentUser, getLanguage, requireAuth('all'), fetchMany);
router.post(
  '/fetch/:moduleId',
  currentUser,
  getLanguage,
  requireAuth('all'),
  fetchOne,
);

export default router;
