import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  CONFIG,
  currentUser,
  getLanguage,
  requireAuth,
  validateResult,
  BadRequestError,
  UnexpectedError,
  LANG,
} from '@gustafdahl/schoolable-common';

const router = Router();

import logger from '../utils/logger';

import fileFilter from '../utils/fileFilter';

const storage = multer.memoryStorage();

const uploadHandler = multer({
  storage,
  limits: { fileSize: CONFIG.maxFileSize },
  fileFilter,
}).single('file');

import upload from './upload';
router.post(
  '/upload',
  currentUser,
  getLanguage,
  requireAuth('all'),
  (req: Request, res: Response, next: NextFunction) => {
    uploadHandler(req, res, (err) => {
      const lang = LANG[`${req.lang}`];

      if (err instanceof multer.MulterError) {
        next(new BadRequestError(lang[`${err.code}`]));
      } else if (err) {
        switch (err.message) {
          case 'Multipart: Boundary not found':
            throw new BadRequestError(lang.needFile);
          default:
            logger.error(`Ran into an unexpected error. ${err}`);
            throw new UnexpectedError();
        }
      }
      next();
    });
  },
  [
    body('access')
      .optional()
      .isString()
      .withMessage((value, { req }) => {
        return LANG[`${req.lang}`].needString;
      }),
  ],
  validateResult,
  upload,
);

export default router;
