/** @format */

import { Router, Request, Response } from 'express';
import { CONFIG, ConfigHandler } from '@schoolable/common';

import { logger } from '../../logger/logger';
import { authenticate } from '../../middlewares/authenticate';

const saveSettingsRouter = Router();

saveSettingsRouter.put(
  '/api/settings',
  authenticate,
  async (req: Request, res: Response) => {
    const data = req.body;

    for (const key in data) {
      CONFIG[key] = data[key];
    }

    ConfigHandler.saveConfig();

    res.status(204).send();
  },
);

export default saveSettingsRouter;
