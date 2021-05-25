/** @format */

import mongoose from 'mongoose';

import { app } from './app';
import { ConfigHandler, CONFIG } from './lib/misc/config';
import logger from './lib/misc/winston';

const start = async () => {
  const { env } = process;

  env.NODE_ENV = !env.NODE_ENV ? 'dev' : env.NODE_ENV;

  app.listen(CONFIG.port, () => {
    if (env.NODE_ENV === 'dev') {
      logger.info(`Listening on port *:${CONFIG.port}`);
    }
  });
};

start();
