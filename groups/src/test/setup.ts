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
import { sign } from 'cookie-signature';

import User, { UserDoc } from '../models/user';
import { GroupDoc } from '../models/group';

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

import { app } from '../app';
app; // Load env variables in app

interface CreateGroup {
  group: GroupDoc;
  cookie: string;
}

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(userType?: UserTypes, email?: string): Promise<string[]>;
      createGroup(): Promise<CreateGroup>;
      createUser(
        userType: UserTypes,
        email: string,
        userId: string,
      ): Promise<UserDoc>;
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

global.createUser = async (
  userType: UserTypes,
  email: string,
  userId: string,
) => {
  const name = {
    first: faker.name.firstName(),
    last: faker.name.lastName(),
  };

  const user = User.build({
    // @ts-ignore
    _id: userId,
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

  const user = await global.createUser(userType, email, userId);

  const payload: UserPayload = {
    sessionId: 'adasdagafag',
    id: user.id,
    email: user.email,
    userType: user.userType,
    lang: 'ENG',
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);
  const signedCookie = `s:${sign(token, process.env.JWT_KEY as string)}`;

  return [`token=${signedCookie}; path=/`];
};

global.createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

global.createGroup = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/groups/create')
    .set('Cookie', cookie)
    .send({ name: faker.name.firstName() })
    .expect(201);

  return { group: res.body.group, cookie };
};
