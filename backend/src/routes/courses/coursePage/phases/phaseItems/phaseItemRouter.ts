/** @format */

import { Router } from 'express';

const phaseItemRouter = Router();

import createPhaseItemRouter from './createPhaseItem';
phaseItemRouter.use(createPhaseItemRouter);

import updatePhaseItemRouter from './updatePhaseItem';
phaseItemRouter.use(updatePhaseItemRouter);

export default phaseItemRouter;
