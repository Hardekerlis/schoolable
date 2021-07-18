/** @format */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';
import User from '../models/user';
import { connect } from '../database/connect';

import { winstonTestSetup, ConfigHandler, CONFIG } from '@schoolable/common';

// Needs to happen in this specific order
const configPath =
  __dirname.substring(0, __dirname.indexOf('/backend')) +
  '/config/app-config.yml';

ConfigHandler.loadConfig(configPath);

import { logger } from '../logger/logger';
logger.debug('Setting up test...');
winstonTestSetup();

// The tests timesout if the default timout interval is not changed
jest.setTimeout(600000);

// let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  // mongo = new MongoMemoryServer();
  // const mongoUri = await mongo.getUri();
  //
  // mongoose.connect(
  //   mongoUri,
  //   {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useCreateIndex: true,
  //     useFindAndModify: false,
  //   },
  //   (err) => {
  //     if (err) throw console.error(err);
  //   },
  // );

  await connect();
});

// Removes all items from the database before each test
beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  await User.createIndexes();
});

// Stops mongo after tests
afterAll(async () => {
  // await mongo.stop();
  await mongoose.connection.close();
});

(global as any).getAdminAuthCookie = async () => {
  const adminBackendUrl = `http://localhost:${CONFIG.port}`;
  const validRequestData = {
    email: 'test@test.com',
    password: 'password',
    confirmPassword: 'password',
    name: 'John Doe',
  };

  let res = await request(adminBackendUrl)
    .post(`/api/register`)
    .send(validRequestData);

  if (res.body.errors) {
    res = await request(adminBackendUrl)
      .post('/api/login')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);
  }

  const cookie = res.get('Set-Cookie');

  return cookie;
};
