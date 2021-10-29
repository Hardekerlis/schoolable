import { Router } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  LANG,
} from '@gustafdahl/schoolable-common';

const router = Router();

import login from './login';
router.post(
  '/',
  getLanguage,
  [
    body('email')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noEmail;
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needValidEmail;
      }),
    body('password')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].noPassword;
      })
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].passwordMustBeString;
      }),
  ],
  validateResult,
  login,
);

import check from './check';
router.get('/check', currentUser, getLanguage, check);

import fetch from './fetch';
router.get('/all', currentUser, getLanguage, requireAuth('all'), fetch);

import { killCurrent, killAll, killById } from './kill';
router.delete(
  '/current',
  currentUser,
  getLanguage,
  requireAuth('all'),
  killCurrent,
);
router.delete('/all', currentUser, getLanguage, requireAuth('all'), killAll);
router.delete(
  '/:sessionId',
  currentUser,
  getLanguage,
  requireAuth('all'),
  killById,
);

export default router;
