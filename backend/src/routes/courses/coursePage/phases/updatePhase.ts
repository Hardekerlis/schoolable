/** @format */

import { Router, Request, Response } from 'express';
const updatePhaseRouter = Router();
import mongoose from 'mongoose';

import { authenticate } from '../../../../middlewares/authenticate';
import { checkUserType } from '../../../../middlewares/checkUserType';

import {
  UserTypes,
  NotAuthorizedError,
  BadRequestError,
  NotFoundError,
} from '../../../../library';

import Course from '../../../../models/course';
import Phase from '../../../../models/phase';

import { logger } from '../../../../logger/logger';

updatePhaseRouter.put(
  '/api/course/:courseId/:phaseId',
  authenticate,
  checkUserType([UserTypes.Teacher, UserTypes.Admin]),
  async (req: Request, res: Response) => {
    res.send();
  },
);

export default updatePhaseRouter;
