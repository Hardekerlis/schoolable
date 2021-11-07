/** @format */

import { app } from './app';
import { CONFIG } from '@gustafdahl/schoolable-common';
import logger from './utils/logger';
import { natsWrapper } from './utils/natsWrapper';

import {
  CoruseCreatedListener,
  RemoveModuleListener,
  CourseUpdatedListener,
  CourseRemovedListener,
  UserRemovedListener,
  CourseAddedAdminListener,
  CourseAddedStudentListener,
  CourseRemovedStudentListener,
  CourseRemovedAdminListener,
} from './events/listeners/';

import mongoose from 'mongoose';

const startServer = async () => {
  const { env } = process;

  if (!env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

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

    logger.debug('Registered CoruseCreatedListener for nats');
    new CoruseCreatedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered RemoveModuleListener for nats');
    new RemoveModuleListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseUpdatedListener for nats');
    new CourseUpdatedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedListener for nats');
    new CourseRemovedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered UserRemovedListener for nats');
    new UserRemovedListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseAddedAdminListener for nats');
    new CourseAddedAdminListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseAddedStudentListener for nats');
    new CourseAddedStudentListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedStudentListener for nats');
    new CourseRemovedStudentListener(natsWrapper.client, logger).listen();

    logger.debug('Registered CourseRemovedStudentListener for nats');
    new CourseRemovedAdminListener(natsWrapper.client, logger).listen();

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
