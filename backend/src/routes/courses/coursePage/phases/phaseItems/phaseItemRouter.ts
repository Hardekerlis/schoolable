/** @format */

import { Router } from 'express';

const phaseItemRouter = Router();

import createPhaseItemRouter from './createPhaseItem';
phaseItemRouter.use(createPhaseItemRouter);

export default phaseItemRouter;
