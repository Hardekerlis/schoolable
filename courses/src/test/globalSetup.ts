/** @format */

import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

import { ConfigHandler, CONFIG } from '@gustafdahl/schoolable-utils';

const configPath =
  __dirname.substring(0, __dirname.indexOf('/src')) + '/config/config.yml';

ConfigHandler.loadConfig(configPath);

declare global {
  namespace NodeJS {
    interface Global {
      _MONGOINSTANCE: MongoMemoryServer;
    }
  }
}

export = async function globalSetup() {
  if (CONFIG.database.useMemoryLocal) {
    const instance = await MongoMemoryServer.create();
    const uri = instance.getUri();

    global._MONGOINSTANCE = instance;

    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  } else {
    process.env.MONGO_URI = `mongodb://${CONFIG.database.localIp}:${CONFIG.database.port}`;
  }

  await mongoose.connect(`${process.env.MONGO_URI}/${CONFIG.database.name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
