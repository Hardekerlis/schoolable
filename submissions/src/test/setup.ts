import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import path from 'path';
import {
  CONFIG,
  ConfigHandler,
  winstonTestSetup,
  UserTypes,
  UserPayload,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { sign } from 'cookie-signature';
jest.mock('../utils/b2');

const b2Keys = JSON.parse(
  fs.readFileSync(
    __dirname.substring(0, __dirname.indexOf(`/src`)) +
      '/backblaze.secret.json',
    'utf8',
  ),
);

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

process.env.B2_API_TOKEN_ID = b2Keys.B2_API_TOKEN_ID;
process.env.B2_API_TOKEN = b2Keys.B2_API_TOKEN;

import { app } from '../app';
app; // Load env variables in app

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(
        userType?: UserTypes,
        email?: string,
        id?: string,
      ): Promise<string[]>;
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

global.getAuthCookie = async (
  userType?: UserTypes,
  email?: string,
  id?: string,
): Promise<string[]> => {
  if (!userType) userType = UserTypes.Teacher;
  if (!email) email = faker.internet.email();
  if (!id) id = new mongoose.Types.ObjectId().toHexString();

  const payload: UserPayload = {
    sessionId: 'asdasgasgsa',
    id,
    email,
    userType,
    lang: 'ENG',
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);
  const signedCookie = `s:${sign(token, process.env.JWT_KEY as string)}`;

  return [`token=${signedCookie}; path=/`];
};
