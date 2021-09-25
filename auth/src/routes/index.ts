/** @format */

import { Router } from 'express';
import {
  currentUser,
  validateResult,
  getLanguage,
  requireAuth,
} from '@gustafdahl/schoolable-middlewares';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { body } from 'express-validator';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const router = Router();

import register from './register';
router.post(
  '/register',
  currentUser,
  getLanguage,
  [
    body('email')
      .exists()
      .isEmail()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidEmail;
      }),
    body('userType')
      .exists()
      .custom((value, { req }) => {
        if (!Object.values(UserTypes).includes(value)) {
          return LANG[`${req.lang}`].needValidUserType;
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

import login from './login';
router.post(
  '/login',
  getLanguage,
  [
    body('email')
      .exists()
      .isEmail()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].invalidEmail;
      }),
    body('password')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPassword;
      }),
  ],
  validateResult,
  login,
);

import remove from './remove';
router.use(
  '/remove',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin]),
  [
    body('id')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needId;
      }),
  ],
  validateResult,
  remove,
);

import logout from './logout';
router.get('/logout', currentUser, getLanguage, logout);

export default router;
