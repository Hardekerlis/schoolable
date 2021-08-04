/** @format */

import { app } from './app';
import { CONFIG } from '@schoolable/common';
import { logger } from './logger/logger';
import { connect } from './database/connect';

const startServer = async () => {
  const { env } = process;

  // TODO
  // Add connection to mongo db

  // if (!process.env.MONGO_URI) {
  //   throw new Error('MONGO_URI must be defined');
  // }
  //
  // try {
  //   await mongoose.connect(process.env.MONGO_URI!, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useCreateIndex: true,
  //   });
  //   console.log('Connected to MongoDB');
  // } catch (err) {
  //   console.error(err);
  // }

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  logger.info('Connecting to MongoDb');
  await connect();

  env.NODE_ENV = !env.NODE_ENV ? 'dev' : env.NODE_ENV;

  app.listen(CONFIG.port + 1, () => {
    logger.info(`Listening on port *:${CONFIG.port + 1}`);
  });
};

if (!CONFIG.setupComplete) {
  logger.info('Starting setup...');
} else if (CONFIG.setupComplete) {
  logger.debug('Setup has been completed');
  logger.info('Starting the server...');
}

startServer();
