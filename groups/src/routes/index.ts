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

import remove from './remove';
router.delete(
  '/remove',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher]),
  [
    body('groupId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needGroupId;
      })
      .bail()
      .custom((value, { req }) => {
        if (!isValidObjectId(value)) {
          throw new Error(LANG[`${req.lang}`].invalidGroupId);
        }

        return value;
      }),
  ],
  validateResult,
  remove,
);

export default router;
