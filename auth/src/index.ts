/** @format */

import { app } from './app';
import { CONFIG } from '@gustafdahl/schoolable-utils';
import logger from './utils/logger';
import { connectToMongo } from '@gustafdahl/schoolable-utils';
import 'colors';

const startServer = async () => {
  const { env } = process;
  console.clear();

  logger.info('Starting server...');

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  try {
    logger.info('Connecting to MongoDB');
    await connectToMongo();
    logger.info('Successfully connected to MongoDB');
  } catch (err) {
    logger.warn(`Failed to connect to MongoDB. Error message: ${err}`);
  }

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
