/** @format */

import { Router, Request, Response } from 'express';
const removeCourseRouter = Router();
import { BadRequestError, NotAuthorizedError } from '@schoolable/common';

import { authenticate } from '../../middlewares/authenticate';

import { logger } from '../../logger/logger';

/*
  TODO
  Add course menu items
*/

import User from '../../models/user';
import Course from '../../models/course';

removeCourseRouter.delete(
  '/api/course',
  authenticate,
  async (req: Request, res: Response) => {
    res.send();
  },
);

export default removeCourseRouter;
