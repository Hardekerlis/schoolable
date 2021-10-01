import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
} from '@gustafdahl/schoolable-middlewares';
import { UserTypes } from '@gustafdahl/schoolable-enums';

const router = Router();

import create from './create';
router.post(
  '/create',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Admin, UserTypes.Teacher, UserTypes.TempTeacher]),
  create,
);

export default router;
