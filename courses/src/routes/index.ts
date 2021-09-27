import { Router } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  requireAuth,
  validateResult,
  getLanguage,
} from '@gustafdahl/schoolable-middlewares';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { UserTypes } from '@gustafdahl/schoolable-enums';

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
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needName;
      }),
  ],
  validateResult,
  create,
);

export default router;
