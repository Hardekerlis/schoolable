/** @format */

import { Router, Request, Response } from 'express';
import { CONFIG } from '@schoolable/common';

import { logger } from '../../logger/logger';

const fetchSettingsRouter = Router();

fetchSettingsRouter.get(
  '/api/settings',
  async (req: Request, res: Response) => {
    logger.info('Gettings application settings');
    res.status(200).json(CONFIG);
  },
);

export default fetchSettingsRouter;
