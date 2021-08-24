/** @format */

import { Router } from 'express';

const phasesRouter = Router();

import createPhaseRouter from './createPhase';
phasesRouter.use(createPhaseRouter);

export default phasesRouter;
