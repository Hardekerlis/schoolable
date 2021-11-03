import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  UserTypes,
  validateResult,
  LANG,
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
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needName;
      })
      .bail()
      .isAlphanumeric('sv-SE')
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].allowedCharacters;
      }),
    body('users')
      .optional()
      .isArray()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].mustArray;
      }),
  ],
  validateResult,
  create,
);

export default router;
