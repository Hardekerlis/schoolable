/** @format */

import { Router } from 'express';
const router = Router();

import { app } from '../app';

import { firstAdminAccountRouter } from './firstAdminAccount';
import { CONFIG } from '../lib/misc/config';

// This will run if setupComplete is false in config
export const setup = async () => {
  // app.use(firstAdminAccount);
};

router.use(firstAdminAccountRouter);

export { router as setupRouter };
