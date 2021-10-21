import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
} from '@gustafdahl/schoolable-middlewares';

const router = Router();

import get from './get';
router.get('/', get);

import { killCurrent, killAll, killById } from './kill';
router.get(
  '/current',
  currentUser,
  getLanguage,
  requireAuth('all'),
  killCurrent,
);
router.get('/all', currentUser, getLanguage, requireAuth('all'), killAll);
router.get(
  '/:sessionId',
  currentUser,
  getLanguage,
  requireAuth('all'),
  killById,
);

export default router;
