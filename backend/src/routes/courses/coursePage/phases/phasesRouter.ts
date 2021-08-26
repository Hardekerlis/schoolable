/** @format */

import { Router } from 'express';

const phasesRouter = Router();

import createPhaseRouter from './createPhase';
phasesRouter.use(createPhaseRouter);

import updatePhaseRouter from './updatePhase';
phasesRouter.use(updatePhaseRouter);

import phaseItemRouter from './phaseItems/phaseItemRouter';
phasesRouter.use(phaseItemRouter);

export default phasesRouter;
