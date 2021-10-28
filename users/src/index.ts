/** @format */

import { app } from './app';
import { CONFIG, UserTypes } from '@gustafdahl/schoolable-common';
import logger from './utils/logger';
import { natsWrapper } from './utils/natsWrapper';
import mongoose from 'mongoose';

import User from './models/user';

(async () => {
  const { env } = process;

  if (!env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  logger.info('Starting server...');

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  try {
    logger.info('Connecting to NATS');
    await natsWrapper.connect(
      CONFIG.nats.clusterId,
      env.NATS_CLIENT_ID as string,
      CONFIG.nats.url,
    );
    natsWrapper.client.on('connect', () => {
      logger.info('Successfully connected to NATS');
    });

    natsWrapper.client.on('error', (err) => {
      logger.error(`NATS client ran into an issue. Error: ${err}`);
    });

    natsWrapper.client.on('close', () => {
      logger.warn('NATS connection closed');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // Register listeners here!

    logger.info('Connecting to MongoDB');
    await mongoose.connect(
      `mongodb://${CONFIG.database.uri}:${CONFIG.database.port}/${CONFIG.database.name}`,
    );
    logger.info('Successfully connected to MongoDB');
  } catch (err) {
    logger.warn(`Failed to connect to MongoDB. Error message: ${err}`);
  }

  const user = await User.findOne({ userType: UserTypes.Admin });
  if (user) {
    env.ADMIN_EXISTS = 'true';
  }

  env.NODE_ENV = !env.NODE_ENV ? 'dev' : env.NODE_ENV;

  app.listen(CONFIG.port, () => {
    logger.info(`Listening on port *:${CONFIG.port}`);
  });
})();
