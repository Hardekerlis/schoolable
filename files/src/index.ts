/** @format */

import { app } from './app';
import { CONFIG } from '@gustafdahl/schoolable-common';
import logger from './utils/logger';
import { natsWrapper } from './utils/natsWrapper';

import mongoose from 'mongoose';

import {
  CourseAddedAdminListener,
  CourseAddedStudentListener,
  CourseCreatedListener,
  CourseRemovedListener,
  CourseRemovedAdminListener,
  CourseRemovedStudentListener,
} from './events/listeners';

const startServer = async () => {
  const { env } = process;

  if (!env.B2_API_TOKEN) {
    throw new Error('B2_API_TOKEN must be defined');
  }

  if (!env.B2_API_TOKEN_ID) {
    throw new Error('B2_API_TOKEN_ID must be defined');
  }

  if (!env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  console.clear();

  logger.info('Starting the server...');

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  try {
    await natsWrapper.connect(
      CONFIG.nats.clusterId,
      env.NATS_CLIENT_ID as string,
      CONFIG.nats.url,
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // Register listeners below this line
    logger.debug('Registered CourseAddedAdminListener for nats');
    new CourseAddedAdminListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseAddedStudentListener for nats');
    new CourseAddedStudentListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseCreatedListener for nats');
    new CourseCreatedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedListener for nats');
    new CourseRemovedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedAdminListener for nats');
    new CourseRemovedAdminListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedStudentListener for nats');
    new CourseRemovedStudentListener(natsWrapper.client, logger).listen();

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

startServer();
