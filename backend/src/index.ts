/** @format */

import { app } from './app';
import { CONFIG } from '@schoolable/common';
import { logger } from './logger/logger';
import { connect } from './database/connect';

const startServer = async () => {
  const { env } = process;

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  logger.info('Connecting to MongoDb');
  await connect();

  env.NODE_ENV = !env.NODE_ENV ? 'dev' : env.NODE_ENV;

  app.listen(CONFIG.port, () => {
    logger.info(`Listening on port *:${CONFIG.port}`);
  });
};

if (!CONFIG.setupComplete) {
  logger.info('Starting setup...');
} else if (CONFIG.setupComplete) {
  logger.debug('Setup has been completed');
  logger.info('Starting the server...');
}

startServer();
