/** @format */

import { Router } from 'express';
import {
  currentUser,
  validateResult,
  getLanguage,
  requireAuth,
  LANG,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { body } from 'express-validator';

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
router.delete(
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

// import logout from './logout';
// router.get('/logout', currentUser, getLanguage, logout);

import check from './check';
router.get('/check', currentUser, getLanguage, check);

export default router;
