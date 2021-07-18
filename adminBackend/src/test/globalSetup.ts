/** @format */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ConfigHandler, CONFIG } from '@schoolable/common';

import { connect } from '../utils/connect';

const configPath =
  __dirname.substring(0, __dirname.indexOf('/adminBackend')) +
  '/config/app-config.yml';

ConfigHandler.loadConfig(configPath);

export = async function globalSetup() {
  await connect();

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
