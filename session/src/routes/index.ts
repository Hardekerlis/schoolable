import { Router } from 'express';
import {
  currentUser,
  getLanguage,
  requireAuth,
} from '@gustafdahl/schoolable-common';

const router = Router();

import get from './get';
router.get('/', getLanguage, get);

import fetch from './fetch';
router.get('/active', currentUser, getLanguage, requireAuth('all'), fetch);

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
