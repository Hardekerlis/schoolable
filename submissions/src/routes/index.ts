import { Router, NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
} from '@gustafdahl/schoolable-middlewares';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { CONFIG } from '@gustafdahl/schoolable-utils';
import {
  UnexpectedError,
  BadRequestError,
} from '@gustafdahl/schoolable-errors';

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
    body('parentCourse')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needParentCourse;
      }),
    body('parentPhase')
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

export default router;
