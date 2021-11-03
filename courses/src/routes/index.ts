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
  [
    body('owner')
      .optional()
      .not()
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidField;
      }),
    body('admins')
      .optional()
      .not()
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidField;
      }),
    body('students')
      .optional()
      .not()
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidField;
      }),
    body('deletion')
      .optional()
      .not()
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidField;
      }),
    body('name')
      .optional()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needString;
      }),
    body('locked')
      .optional()
      .isBoolean()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needBoolean;
      }),
    body('unlockOn')
      .optional()
      .isDate()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needDate;
      }),
    body('lockOn')
      .optional()
      .isDate()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needDate;
      }),
    body('hidden')
      .optional()
      .isBoolean()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needBoolean;
      }),
    body('visibleOn')
      .optional()
      .isDate()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needDate;
      }),

    body('coursePage')
      .optional()
      .not()
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidField;
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
  update.course,
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

router.post(
  '/remove/student',
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
  students.remove,
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

router.post(
  '/remove/admin',
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
  admins.remove,
);

export default router;
