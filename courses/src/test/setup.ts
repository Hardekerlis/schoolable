/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import {
  CONFIG,
  winstonTestSetup,
  UserPayload,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import User from '../models/user';

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

const createUser = async (
  userType: UserTypes,
  email: string,
  userId: string,
) => {
  const name = {
    first: faker.name.firstName(),
    last: faker.name.lastName(),
  };

  const user = User.build({
    userId,
    email,
    userType,
    name,
  });

  await user.save();

  return user;
};

global.getAuthCookie = async (
  userType?: UserTypes,
  email?: string,
  userId?: string,
): Promise<string[]> => {
  if (!userType) userType = UserTypes.Teacher;
  if (!email) email = faker.internet.email();
  if (!userId) userId = new mongoose.Types.ObjectId().toHexString();

  const user = await createUser(userType, email, userId);

  const payload: UserPayload = {
    sessionId: 'adasdagafag',
    id: user.userId,
    email: user.email,
    userType: user.userType,
    lang: 'ENG',
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);

  return [`token=${token}; path=/`];
};
