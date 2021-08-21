/** @format */

import { Router } from 'express';

const courseRouter = Router();

import createCourseRouter from './createCourse';
courseRouter.use(createCourseRouter);

import fetchCourseRouter from './fetchCourse';
courseRouter.use(fetchCourseRouter);

import removeCourseRouter from './removeCourse';
courseRouter.use(removeCourseRouter);

import updateCourseRouter from './updateCourse';
courseRouter.use(updateCourseRouter);

import coursePageRouter from './coursePage/coursePageRouter';
courseRouter.use(coursePageRouter);

export default courseRouter;
