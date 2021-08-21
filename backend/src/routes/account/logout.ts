/** @format */

import { Router, Request, Response } from 'express';

import Session from '../../models/session';
import { logger } from '../../logger/logger';
import { authenticate } from '../../middlewares/authenticate';
import { NotAuthorizedError } from '../../library';

const logoutRouter = Router();

// TODO
// Remove hardcoded text

logoutRouter.get(
  '/api/logout',
  authenticate,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser;

    logger.debug('Logging out user');

    if (!currentUser) {
      logger.debug('No user to logout found');
      throw new NotAuthorizedError('Please login before you do that');
    }

    logger.info('Removing user session from database');
    await Session.findByIdAndRemove(currentUser.sessionId);

    logger.info('Removing session cookie from user');
    res.clearCookie('session');

    res.status(200).json({
      error: false,
      msg: 'Successfully logged out',
    });
  },
);

export default logoutRouter;
