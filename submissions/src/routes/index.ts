import { Router, NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  UserTypes,
  Grades,
  LANG,
  CONFIG,
  UnexpectedError,
  BadRequestError,
} from '@gustafdahl/schoolable-common';

const router = Router();

import multer from 'multer';
const storage = multer.memoryStorage();

import fileFilter from '../utils/fileFilter';

const uploadHandler = multer({
  storage: storage,
  limits: { fileSize: CONFIG.maxFileSize },
  fileFilter,
}).array('files', 5);

import upload from './upload';
router.post(
  '/upload',
  currentUser,
  getLanguage,
  requireAuth([
    UserTypes.Admin,
    UserTypes.Teacher,
    UserTypes.TempTeacher,
    UserTypes.Student,
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        next(new BadRequestError(LANG[`${req.lang}`][`${err.code}`]));
      } else if (err) {
        next(new UnexpectedError());
      }
      next();
    });
  },
  [
    body('parentCourseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needParentCourse;
      }),
    body('parentPhaseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needParentPhase;
      }),
    body('phaseItemId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseItemId;
      }),
  ],
  validateResult,
  upload,
);

import fetch from './fetch';
router.post(
  '/fetch',
  currentUser,
  getLanguage,
  requireAuth([
    UserTypes.Admin,
    UserTypes.Teacher,
    UserTypes.TempTeacher,
    UserTypes.Student,
  ]),
  [
    body('phaseItemId')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseItemId;
      }),
  ],
  validateResult,
  fetch,
);

import download from './download';
router.get(
  '/download/:fileId',
  currentUser,
  getLanguage,
  requireAuth([
    UserTypes.Admin,
    UserTypes.Teacher,
    UserTypes.TempTeacher,
    UserTypes.Student,
  ]),
  download,
);

import grade from './grade';
router.post(
  '/grade',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  [
    body('fileId')
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needFileId;
      }),
    body('grade').custom((value, { req }) => {
      if (!Object.values(Grades).includes(value)) {
        return LANG[`${req.lang}`].invalidGrade;
      }
      return value;
    }),
  ],
  validateResult,
  grade,
);

export default router;
