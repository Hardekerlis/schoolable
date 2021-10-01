/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import path from 'path';
import {
  CONFIG,
  ConfigHandler,
  winstonTestSetup,
} from '@gustafdahl/schoolable-utils';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { UserPayload } from '@gustafdahl/schoolable-interfaces';
import jwt from 'jsonwebtoken';

import { app } from '../app';
app; // Load env variables in app

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(userType?: UserTypes, email?: string): Promise<string[]>;
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
): Promise<string[]> => {
  if (!userType) userType = UserTypes.Teacher;
  if (!email) email = faker.internet.email();

  const payload: UserPayload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email,
    userType,
    lang: 'ENG',
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);

  return [`token=${token}; path=/`];
};