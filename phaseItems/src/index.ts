/** @format */

import { app } from './app';
import { CONFIG } from '@gustafdahl/schoolable-common';
import logger from './utils/logger';
import { natsWrapper } from './utils/natsWrapper';

import { CourseCreatedListener } from './events/listeners/courseCreated';
import { CourseRemovedListener } from './events/listeners/courseRemoved';
import { CourseUpdatedListener } from './events/listeners/courseUpdated';
import { PhaseRemovedListener } from './events/listeners/phaseRemoved';
import { PhaseCreatedListener } from './events/listeners/phaseCreated';
import { RemovePhaseItemListener } from './events/listeners/removePhaseItem';

import mongoose from 'mongoose';

const startServer = async () => {
  const { env } = process;

  if (!env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  console.clear();

  logger.info('Starting server...');

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  try {
    await natsWrapper.connect(
      CONFIG.nats.clusterId,
      process.env.NATS_CLIENT_ID as string,
      CONFIG.nats.url,
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    logger.debug('Registered CourseCreatedListener for nats');
    new CourseCreatedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered PhaseRemovedListener for nats');
    new PhaseRemovedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseUpdatedListener for nats');
    new CourseUpdatedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedListener for nats');
    new CourseRemovedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered PhaseCreatedListener for nats');
    new PhaseCreatedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered RemovePhaseItemListener for nats');
    new RemovePhaseItemListener(natsWrapper.client, logger).listen();

    logger.info('Connecting to MongoDB');
    await mongoose.connect(
      `mongodb://${CONFIG.database.uri}:${CONFIG.database.port}/${CONFIG.database.name}`,
    );
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
