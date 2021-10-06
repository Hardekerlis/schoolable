import { Router } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
} from '@gustafdahl/schoolable-middlewares';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

const router = Router();

import multer from 'multer';
const storage = multer.memoryStorage();

import fileFilter from '../utils/fileFilter';

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
  multer({ storage: storage, fileFilter }).array('files', 5),
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
