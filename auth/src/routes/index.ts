/** @format */

import { Router, NextFunction, Request, Response } from 'express';
import {
  currentUser,
  validateResult,
  getLanguage,
  requireAuth,
} from '@gustafdahl/schoolable-middlewares';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { body } from 'express-validator';

import { UserTypes } from '@gustafdahl/schoolable-enums';
import { CONFIG } from '@gustafdahl/schoolable-utils';

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
      .withMessage('Please supply a valid email'),
    body('userType')
      .exists()
      .custom((value, { req }) => {
        if (!Object.values(UserTypes).includes(value)) {
          return 'Please supply a valid userType';
        }
        return value;
      }),
    body('name.first')
      .exists()
      .isString()
      .withMessage('Please supply a first name'),
    body('name.last')
      .exists()
      .isString()
      .withMessage('Please supply a last name'),
  ],
  validateResult,
  register,
);

// function (allowedUserType) {
//         return function (req, res, next) {
//             if (!req.currentUser) {
//                 throw new schoolable_errors_1.NotAuthorizedError();
//             }
//             var userType = req.currentUser.userType;
//             var isAllowed = false;
//             for (var _i = 0, allowedUserType_1 = allowedUserType; _i < allowedUserType_1.length; _i++) {
//                 var i = allowedUserType_1[_i];
//                 if (i === userType) {
//                     isAllowed = true;
//                     break;
//                 }
//             }
//             if (isAllowed) {
//                 next();
//             }
//             else {
//                 throw new schoolable_errors_1.NotAuthorizedError();
//             }
//         };
//     }
//
// function (allowedUserType) {
//         return function (req, res, next) {
//             try {
//                 if (!req.currentUser) {
//                     throw new schoolable_errors_1.NotAuthorizedError();
//                 }
//                 var lang = req.currentUser.lang;
//                 var userType = req.currentUser.userType;
//                 var isAllowed = false;
//                 for (var _i = 0, allowedUserType_1 = allowedUserType; _i < allowedUserType_1.length; _i++) {
//                     var i = allowedUserType_1[_i];
//                     if (i === userType) {
//                         isAllowed = true;
//                         break;
//                     }
//                 }
//                 if (isAllowed) {
//                     next();
//                 }
//                 else {
//                     throw new schoolable_errors_1.NotAuthorizedError();
//                 }
//             }
//             catch (err) {
//                 console.error(err);
//                 res.status(500).send();
//             }
//         };
//     }

//
// import login from './login';
// router.post(
//   '/login',
//   getLanguage,
//   [
//     body('email')
//       .exists()
//       .isEmail()
//       .withMessage((value, { req }) => {
//         console.log(req.lang);
//
//         return value;
//       }),
//   ],
//   validateResult,
//   login,
// );

export default router;
