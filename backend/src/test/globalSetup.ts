/** @format */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { CONFIG } from '../lib/misc/config';

export = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  const uri = await instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  // To make sure the database is empty
  await mongoose.connect(`${process.env.MONGO_URI}/${CONFIG.database.name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
