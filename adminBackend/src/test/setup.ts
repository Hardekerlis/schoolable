/** @format */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';
import User from '../models/user';
import { connect } from '../utils/connect';

import { winstonTestSetup, ConfigHandler } from '@schoolable/common';

// Needs to happen in this specific order
const configPath =
  __dirname.substring(0, __dirname.indexOf('/adminBackend')) +
  '/config/app-config.yml';
ConfigHandler.loadConfig(configPath);

import { logger } from '../logger/logger';
logger.debug('Setting up test...');
winstonTestSetup();

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): Promise<string[]>;
    }
  }
}

// The tests timesout if the default timout interval is not changed
jest.setTimeout(600000);

let mongo: any;
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
  await mongo.stop();
  await mongoose.connection.close();
});

global.getAuthCookie = async () => {
  const validRequestData = {
    email: 'test@test.com',
    password: 'password',
    confirmPassword: 'password',
    name: 'John Doe',
  };

  const res = await request(app)
    .post('/api/register')
    .send(validRequestData)
    .expect(201);

  const cookie = res.get('Set-Cookie');

  return cookie;
};

// global.getAuthCookie = async () => {
//   const email = 'test@test.com';
//   const password = 'password';
//
//   const res = await request(app)
//     .post('/api/users/signup')
//     .send({ email, password })
//     .expect(201);
//
//   const cookie = res.get('Set-Cookie');
//
//   return cookie;
// };