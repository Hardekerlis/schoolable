/** @format */

import { Router, Request, Response } from 'express';
import { NotAuthorizedError } from '../../library';

import { authenticate } from '../../middlewares/authenticate';
import { logger } from '../../logger/logger';

const utilsRouter = Router();

// Util api check for verifying if user is signed in
utilsRouter.post(
  '/api/check',
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.currentUser) {
      logger.debug('User is not logged in');

      res.clearCookie('session');

      throw new NotAuthorizedError('Not logged in');
    }

    logger.debug('User is logged in');

    res.status(200).json({
      error: false,
      msg: 'User is logged in',
    });
  },
);

export default utilsRouter;
