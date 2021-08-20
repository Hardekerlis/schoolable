/** @format */

import mongoose from 'mongoose';

import { connect } from '../database/connect';

import { ConfigHandler } from '../library';

const configPath =
  __dirname.substring(0, __dirname.indexOf('/src')) + '/config/app-config.yml';

ConfigHandler.loadConfig(configPath);

export = async function globalSetup() {
  await connect();

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
