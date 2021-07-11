/** @format */

import { Router, Request, Response } from 'express';
import { CONFIG, ConfigHandler } from '@schoolable/common';

import { logger } from '../../logger/logger';
import { authenticate } from '../../middlewares/authenticate';
import Settings from '../../models/settings';

const publishSettingsRouter = Router();

publishSettingsRouter.get(
  '/api/settings/publish',
  authenticate,
  async (req: Request, res: Response) => {
    const settings = Settings.build(CONFIG);
    await settings.save();

    // TODO
    // Add call to the "regular" backend for updating loaded config

    res.status(204).send();
  },
);

export default publishSettingsRouter;
