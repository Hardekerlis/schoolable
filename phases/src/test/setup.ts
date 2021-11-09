/** @format */

import mongoose from 'mongoose';
import faker from 'faker';
import { CONFIG, winstonTestSetup } from '@gustafdahl/schoolable-common';
import { UserTypes, UserPayload } from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import { sign } from 'cookie-signature';

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

jest.mock('../utils/natsWrapper');

import { app } from '../app';
app; // Load env variables in app

import Course, { CourseDoc } from '../models/course';
import Module, { ModuleDoc } from '../models/module';

interface CreateResourceReturnData {
  cookie: string;
  userId: string;
}

interface CreateCourseReturnData extends CreateResourceReturnData {
  course: CourseDoc;
}

interface CreateModuleReturnData extends CreateCourseReturnData {
  _module: ModuleDoc;
}

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(
        userType?: UserTypes,
        email?: string,
        id?: string,
      ): Promise<CreateResourceReturnData>;
      createCourse(): Promise<CreateCourseReturnData>;
      createModule(): Promise<CreateModuleReturnData>;
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
  userId?: string,
): Promise<CreateResourceReturnData> => {
  if (!userType) userType = UserTypes.Teacher;
  if (!email) email = faker.internet.email();
  if (!userId) userId = new mongoose.Types.ObjectId().toHexString();

  const payload: UserPayload = {
    id: userId,
    email,
    userType,
    sessionId: 'asdasdsad',
    lang: 'ENG',
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);
  const signedCookie = `s:${sign(token, process.env.JWT_KEY as string)}`;

  return { cookie: `token=${signedCookie}; path=/`, userId };
};

global.createCourse = async (): Promise<CreateCourseReturnData> => {
  const { userId, cookie } = await global.getAuthCookie();

  const course = Course.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    name: faker.company.companyName(),
    owner: userId,
  });

  await course.save();

  return { userId, cookie, course };
};

global.createModule = async (): Promise<CreateModuleReturnData> => {
  const { cookie, course, userId } = await global.createCourse();

  const _module = Module.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    parentCourseId: course.id,
    name: faker.company.companyName(),
  });

  await _module.save();

  return { cookie, course, userId, _module };
};
