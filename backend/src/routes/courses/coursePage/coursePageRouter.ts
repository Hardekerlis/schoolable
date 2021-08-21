/** @format */

import { Router } from 'express';

const coursePageRouter = Router();

import updateCoursePageRouter from './updateCoursePage';
coursePageRouter.use(updateCoursePageRouter);

export default coursePageRouter;
