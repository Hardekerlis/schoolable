import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import fs from 'fs';
import {
  CONFIG,
  ConfigHandler,
  winstonTestSetup,
  UserTypes,
  UserPayload,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import { sign } from 'cookie-signature';

jest.mock('../utils/logger');
jest.mock('../utils/natsWrapper');

// import Course, { CourseDoc } from '../models/course';
// import Module, { ModuleDoc } from '../models/module';
// import Phase, { PhaseDoc } from '../models/phase';

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

import { app } from '../app';
app; // Load env variables in app

interface AuthReturnData {
  cookie: string;
  userId: string;
}

// interface CreateCourseReturnData extends AuthReturnData {
//   course: CourseDoc;
// }
//
// interface CreateModuleReturnData extends AuthReturnData {
//   _module: ModuleDoc;
// }
//
// interface CreatePhaseReturnData extends AuthReturnData {
//   phase: PhaseDoc;
// }

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(
        userType?: UserTypes,
        email?: string,
        id?: string,
      ): Promise<AuthReturnData>;
      // createCourse(): Promise<CreateCourseReturnData>;
      // createModule(): Promise<CreateModuleReturnData>;
      // createPhase(): Promise<CreatePhaseReturnData>;
      // addStudent(phase: PhaseDoc): Promise<AuthReturnData>;
    }
  }
}

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
): Promise<AuthReturnData> => {
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

  return { cookie: `token=${signedCookie}; path=/`, userId: id };
};

// global.createCourse = async (): Promise<CreateCourseReturnData> => {
//   const { cookie, userId } = await global.getAuthCookie(UserTypes.Teacher);
//
//   const course = Course.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     owner: userId,
//   });
//
//   await course.save();
//
//   return { course, cookie, userId };
// };
//
// global.createModule = async (): Promise<CreateModuleReturnData> => {
//   const { course, cookie, userId } = await global.createCourse();
//
//   const _module = Module.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     name: faker.company.companyName(),
//     parentCourse: course,
//   });
//
//   await _module.save();
//
//   return { _module, cookie, userId };
// };
//
// global.createPhase = async (): Promise<CreatePhaseReturnData> => {
//   const { _module, cookie, userId } = await global.createModule();
//
//   const phase = Phase.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     parentModule: _module,
//   });
//
//   await phase.save();
//
//   return { phase, cookie, userId };
// };
//
// global.addStudent = async (phase: PhaseDoc): Promise<AuthReturnData> => {
//   const { cookie, userId } = await global.getAuthCookie(UserTypes.Student);
//
//   phase.parentModule!.parentCourse!.students!.push(userId);
//   await phase.parentModule.parentCourse.save();
//
//   return { cookie, userId };
// };
