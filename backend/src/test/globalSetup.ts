/** @format */

import mongoose from 'mongoose';
import { ConfigHandler, CONFIG } from '@schoolable/common';

import { connect } from '../database/connect';

const configPath =
  __dirname.substring(0, __dirname.indexOf('/backend')) +
  '/config/app-config.yml';

ConfigHandler.loadConfig(configPath);

export = async function globalSetup() {
  await connect();

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
