import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  validateResult,
  LANG,
  UserTypes,
  requireAuth,
} from '@gustafdahl/schoolable-common';
import { body, query } from 'express-validator';
import { isValidObjectId } from 'mongoose';

const router = Router();

import register from './register';
router.post(
  '/register',
  currentUser,
  getLanguage,
  [
    body('email')
      .isEmail()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidEmail;
      }),
    body('userType')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needUserType;
      })
      .custom((value, { req }) => {
        if (!Object.values(UserTypes).includes(value)) {
          throw new Error(LANG[`${req.lang}`].needValidUserType);
        }
        return value;
      }),
    body('name.first')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noFirstName;
      }),
    body('name.last')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noLastName;
      }),
  ],
  validateResult,
  register,
);

import fetch from './fetch';
router.get(
  '/fetch',
  currentUser,
  getLanguage,
  requireAuth('all'),
  [
    query('usertype')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needUserType;
      })
      .bail()
      .custom((value, { req }) => {
        if (!Object.values(UserTypes).includes(value)) {
          throw new Error(LANG[`${req.lang}`].needValidUserType);
        }
        return value;
      }),
  ],
  validateResult,
  fetch,
);

import remove from './remove';
router.delete(
  '/remove',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin]),
  [
    body('userId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needUserId;
      })
      .bail()
      .custom((value, { req }) => {
        if (!isValidObjectId(value)) {
          throw new Error(LANG[`${req.lang}`].invalidId);
        }
        return value;
      }),
  ],
  validateResult,
  remove,
);

export default router;
