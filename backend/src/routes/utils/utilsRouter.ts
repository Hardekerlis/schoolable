/** @format */

import { Router, Request, Response } from 'express';
import { NotAuthorizedError } from '../../library';

import { authenticate } from '../../middlewares/authenticate';

const utilsRouter = Router();

import createSession from '../../utils/session/createSession';

// Util api check for verifying if user is signed in
utilsRouter.post(
  '/api/check',
  authenticate,
  async (req: Request, res: Response) => {
    const sess = await createSession(req, 'userid', 'jwt');
    console.log(sess);
    if (!req.currentUser) {
      // req.session = null;
      throw new NotAuthorizedError('Not logged in');
    }

    res.send();
  },
);

export default utilsRouter;
