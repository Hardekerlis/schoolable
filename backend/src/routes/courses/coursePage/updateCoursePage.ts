/** @format */

import { Router, Request, Response } from 'express';
const updateCoursePageRouter = Router();

import { authenticate } from '../../../middlewares/authenticate';
import { checkUserType } from '../../../middlewares/checkUserType';
import { UserTypes } from '../../../library';

updateCoursePageRouter.put(
  '/api/coursePage',
  authenticate,
  checkUserType([UserTypes.Admin, UserTypes.Teacher]),
  async (req: Request, res: Response) => {
    res.send();
  },
);

export default updateCoursePageRouter;
