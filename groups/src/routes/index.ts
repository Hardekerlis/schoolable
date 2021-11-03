import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
  UserTypes,
  validateResult,
  LANG,
} from '@gustafdahl/schoolable-common';
import { body, query } from 'express-validator';
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

import addUsers from './addUsers';
router.post(
  '/add/',
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
    body('users')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needUsers;
      })
      .bail()
      .custom((value, { req }) => {
        const lang = LANG[`${req.lang}`];
        if (value instanceof Array && value.length !== -1) {
          for (const user of value) {
            if (!isValidObjectId(user)) {
              throw new Error(lang.invalidUserId);
            }
          }

          return value;
        } else throw new Error(lang.mustArray);
      }),
  ],
  validateResult,
  addUsers,
);

import removeUsers from './removeUsers';
router.post(
  '/remove/',
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
    body('users')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needUsers;
      })
      .bail()
      .custom((value, { req }) => {
        const lang = LANG[`${req.lang}`];
        if (value instanceof Array && value.length !== -1) {
          for (const user of value) {
            if (!isValidObjectId(user)) {
              throw new Error(lang.invalidUserId);
            }
          }

          return value;
        } else throw new Error(lang.mustArray);
      }),
  ],
  validateResult,
  removeUsers,
);

import fetch from './fetch';
router.get(
  '/fetch',
  currentUser,
  getLanguage,
  requireAuth('all'),
  [
    query('name')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needNameQuery;
      }),
  ],
  validateResult,
  fetch,
);

export default router;
