/** @format */

import { Router } from 'express';

const coursePageRouter = Router();

import updateCoursePageRouter from './updateCoursePage';
coursePageRouter.use(updateCoursePageRouter);

import phasesRouter from './phases/phasesRouter';
coursePageRouter.use(phasesRouter);

export default coursePageRouter;
