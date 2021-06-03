/** @format */

import mongoose from 'mongoose';

import { app } from './app';
import { ConfigHandler, CONFIG } from './lib/misc/config';
import { setup } from './setup/startSetup';
import logger from './lib/misc/winston';

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
