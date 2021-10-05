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

import { fetchMany, fetchOne } from './fetch';
router.post(
  '/fetch',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
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
  fetchMany,
);
router.post(
  '/fetch/:phaseItemId',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
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
  fetchOne,
);

import update from './update';
router.put(
  '/update',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('parentPhase')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseId;
      }),
    body('parentCourse')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needParentCourse;
      }),
    body('phaseItemId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseItemId;
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
    body('parentPhase')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseId;
      }),
    body('parentCourse')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needParentCourse;
      }),
    body('phaseItemId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseItemId;
      }),
  ],
  validateResult,
  remove,
);

export default router;
