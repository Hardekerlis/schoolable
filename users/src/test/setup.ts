/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import {
  CONFIG,
  winstonTestSetup,
  UserTypes,
  UserPayload,
  Location,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import { sign } from 'cookie-signature';

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

// import User, { UserDoc } from '../models/user';

import { app } from '../app';
app; // Load env variables in app

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(userType: UserTypes, email?: string): Promise<string[]>;
      getUserData(userType: UserTypes): ValidUser;
      adminCookie?: string;
    }
  }
}

import logger from '../utils/logger';

logger.debug('Setting up tests...');
winstonTestSetup();

jest.mock('../utils/natsWrapper');

jest.setTimeout(600000);

beforeAll(async () => {
  process.env.MONGOMS_DOWNLOAD_URL =
    'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz';
  process.env.MONGOMS_VERSION = '4.2.8';

  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${CONFIG.database.name}`);
  } catch (err) {
    console.error(err);
  }
});

beforeEach(async () => {
  global.adminCookie = undefined;

  try {
    await mongoose.connection.dropDatabase();
  } catch (err) {
    console.error(err);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

interface ValidUser {
  email: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
}

global.getUserData = (userType: UserTypes): ValidUser => {
  return {
    email: faker.internet.email(),
    userType: userType,
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };
};

global.getAuthCookie = async (
  userType: UserTypes,
  email?: string,
): Promise<string[]> => {
  if (!global.adminCookie) {
    const { email, name } = global.getUserData(userType);
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ email, userType: UserTypes.Admin, name })
      .expect(201);

    const adminLoginRes = await request(app).post('/api/auth/login').send({
      email: email,
      password: adminRes.body.tempPassword,
    });

    const [adminCookie] = adminLoginRes.get('Set-Cookie');
    global.adminCookie = adminCookie;
  }

  if (!userType) return [global.adminCookie];

  const userData = global.getUserData(userType);

  const createRes = await request(app)
    .post('/api/auth/register')
    .send({
      email: email ? email : userData.email,
      userType,
      name: userData.name,
    })
    .set('Cookie', global.adminCookie)
    .expect(201);

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: email ? email : userData.email,
      password: createRes.body.tempPassword,
    });

  const cookie = res.get('Set-Cookie');

  return cookie;
};
