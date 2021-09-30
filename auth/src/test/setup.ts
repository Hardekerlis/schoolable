/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import { CONFIG, winstonTestSetup } from '@gustafdahl/schoolable-utils';
import { UserTypes } from '@gustafdahl/schoolable-enums';

import { app } from '../app';

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(userType?: UserTypes, email?: string): Promise<string[]>;
      adminCookie?: string;
    }
  }
}

import logger from '../utils/logger';

logger.debug('Setting up tests...');
winstonTestSetup();

jest.mock('../utils/natsWrapper');

jest.setTimeout(600000);

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

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

const getUserData = () => {
  const email = faker.internet.email();
  const name = {
    first: faker.name.firstName(),
    last: faker.name.lastName(),
  };

  return { email, name };
};

global.getAuthCookie = async (
  userType?: UserTypes,
  email?: string,
): Promise<string[]> => {
  if (!global.adminCookie) {
    const { email, name } = getUserData();
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

  const userData = getUserData();

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
