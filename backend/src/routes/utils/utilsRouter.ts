/** @format */

import { Router, Request, Response } from 'express';
import { NotAuthorizedError, LANG } from '../../library';

import { authenticate } from '../../middlewares/authenticate';
import { getLanguage } from '../../middlewares/getLanguage';
import { logger } from '../../logger/logger';

const utilsRouter = Router();

// Util api check for verifying if user is signed in
utilsRouter.post(
  '/api/check',
  authenticate,
  getLanguage,
  async (req: Request, res: Response) => {
    const lang = LANG[`${req.lang}`];
    if (!req.currentUser) {
      logger.debug('User is not logged in');

      res.clearCookie('session');

      throw new NotAuthorizedError(lang.pleaseLogin);
    }

    logger.debug('User is logged in');

    res.status(200).json({
      error: false,
      msg: lang.userIsLoggedIn,
    });
  },
);

export default utilsRouter;
