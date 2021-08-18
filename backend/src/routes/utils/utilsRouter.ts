/** @format */

import { Router, Request, Response } from 'express';
import { NotAuthorizedError } from '@schoolable/common';

import { authenticate } from '../../middlewares/authenticate';

const utilsRouter = Router();

// Util api check for verifying if user is signed in
utilsRouter.post(
  '/api/check',
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.currentUser) {
      req.session = null;
      throw new NotAuthorizedError('Not logged in');
    }

    res.send();
  },
);

export default utilsRouter;
