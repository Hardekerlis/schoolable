import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  CONFIG,
  currentUser,
  getLanguage,
  requireAuth,
  UserTypes,
  LANG,
  validateResult,
} from '@gustafdahl/schoolable-common';
import { body } from 'express-validator';

import fileFilter from '../utils/fileFilter';

const router = Router();
const storage = multer.memoryStorage();

const uploadHandler = multer({
  storage: storage,
  limits: { fileSize: CONFIG.maxFileSize, fields: 1, files: 5 },
  fileFilter,
}).array('files', 5);

router.get('/health', (req: Request, res: Response) => {
  res.json({ healthy: true });
});

import upload from './upload';
router.post(
  '/upload',
  currentUser,
  getLanguage,
  requireAuth([UserTypes.Student]),
  uploadHandler,
  [
    body('phaseId')
      .exists()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needPhaseId;
      }),
  ],
  validateResult,
  upload,
);

export default router;
