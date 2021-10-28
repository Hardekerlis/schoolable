import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  validateResult,
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

export default router;
