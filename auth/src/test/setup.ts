/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import { app } from '../app';
import { ConfigHandler, CONFIG } from '@gustafdahl/common';

import { UserTypes } from '../utils/usertypes.enum';

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(userType: string): Promise<string[]>;
    }
  }
}

jest.mock('../utils/natsWrapper');

jest.setTimeout(600000);

beforeAll(async () => {
  process.env.MONGOMS_DOWNLOAD_URL =
    'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz';
  process.env.MONGOMS_VERSION = '4.2.8';

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
  } catch (err) {
    console.error(err);
  }
});

beforeEach(async () => {
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

global.getAuthCookie = async (userType: string): Promise<string[]> => {
  const email = faker.internet.email();
  const name = `${faker.name.firstName()} ${faker.name.lastName()}`;

  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, userType, name })
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
