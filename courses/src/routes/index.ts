import { Router } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  requireAuth,
  validateResult,
  getLanguage,
  LANG,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

const router = Router();

import create from './create';
router.post(
  '/create',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher]),
  [
    body('name')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needName;
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
    body('courseId')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needCourseId;
      }),
  ],
  validateResult,
  remove,
);

import { fetchMany, fetchOne } from './fetch';
router.post('/fetch', currentUser, getLanguage, requireAuth('all'), fetchMany);
router.get(
  '/fetch/:courseId',
  currentUser,
  getLanguage,
  requireAuth('all'),
  fetchOne,
);

import update from './update';
router.put(
  '/update',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  update,
);

import students from './students';
router.post(
  '/add/student',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('studentId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needStudentId;
      })
      .bail()
      .custom((value, { req }) => {
        if (!isValidObjectId(value)) {
          throw new Error(LANG[`${req.lang}`].invalidStudentId);
        }

        return value;
      }),
    body('courseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needCourseId;
      })
      .bail()
      .custom((value, { req }) => {
        if (!isValidObjectId(value)) {
          throw new Error(LANG[`${req.lang}`].invalidCourseId);
        }

        return value;
      }),
  ],
  validateResult,
  students.add,
);

import admins from './admins';

router.post(
  '/add/admin',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher]),
  [
    body('adminId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needAdminId;
      })
      .bail()
      .custom((value, { req }) => {
        if (!isValidObjectId(value)) {
          throw new Error(LANG[`${req.lang}`].invalidAdminId);
        }

        return value;
      }),
    body('courseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needCourseId;
      })
      .bail()
      .custom((value, { req }) => {
        if (!isValidObjectId(value)) {
          throw new Error(LANG[`${req.lang}`].invalidCourseId);
        }

        return value;
      }),
  ],
  validateResult,
  admins.add,
);

export default router;
