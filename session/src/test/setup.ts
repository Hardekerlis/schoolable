/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import faker from 'faker';
import { nanoid } from 'nanoid';
import {
  CONFIG,
  ConfigHandler,
  winstonTestSetup,
} from '@gustafdahl/schoolable-utils';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { UserPayload, Location } from '@gustafdahl/schoolable-interfaces';
import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';

import User, { UserDoc } from '../models/user';
import Session, { SessionDoc } from '../models/session';
import { app } from '../app';
app; // Load env variables in app

interface User {
  userId?: string;
  email?: string;
  name: {
    first?: string;
    last?: string;
  };
  userType?: UserTypes;
  lang?: string;
}

interface Session {
  user?: User;
  location?: Location;
  creationTimestamp?: string;
  loginId?: string;
  userAgent?: string;
  ip?: string;
}

interface CreateSessionReturn {
  session: SessionDoc;
  user: UserDoc;
}

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(
        sessionData?: Session,
        userType?: UserTypes,
        email?: string,
        id?: string,
      ): Promise<string[]>;
      getLoginIdCookie(id?: string): Promise<string[]>;
      createUser(userData?: User): Promise<UserDoc>;
      createSession(sessionData?: Session): Promise<CreateSessionReturn>;
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

global.getLoginIdCookie = async (id?: string) => {
  if (!id) id = nanoid();

  return [`loginId=${id}; path=/`];
};

global.createUser = async (userData?: User) => {
  let userId, email, name, userType, lang;
  if (userData) {
    userId = userData.userId;
    email = userData.email;
    name = userData.name;
    userType = userData.userType;
    lang = userData.lang;
  }
  // let { userId, email, name, userType } = userData!;
  // let userId = userData.userId;

  if (!userId) userId = new mongoose.Types.ObjectId().toHexString().toString();
  if (!email) email = faker.internet.email();
  if (!name)
    name = { first: faker.name.firstName(), last: faker.name.lastName() };
  if (!userType) userType = UserTypes.Teacher;
  if (!lang) lang = 'ENG';

  const user = User.build({
    userId,
    email,
    // @ts-ignore
    name,
    userType,
    lang,
  });

  await user.save();

  return user;
};

global.createSession = async (sessionData: Session) => {
  let user, location, creationTimestamp, loginId, userAgent, ip;

  if (sessionData) {
    user = sessionData.user;
    location = sessionData.location;
    creationTimestamp = sessionData.creationTimestamp;
    loginId = sessionData.loginId;
    userAgent = sessionData.userAgent;
    ip = sessionData.ip;
  }

  let actualUser = await global.createUser(user);
  if (!ip) ip = '78.73.146.89';
  if (!location) location = geoip.lookup(ip)!;
  if (!creationTimestamp) creationTimestamp = `${+new Date()}`;
  if (!loginId) loginId = nanoid();
  if (!userAgent)
    userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

  const session = Session.build({
    user: actualUser,
    location,
    creationTimestamp,
    loginId,
    userAgent,
    ip,
  });

  await session.save();

  return { session, user: actualUser };
};

global.getAuthCookie = async (
  sessionData: Session,
  userType?: UserTypes,
  email?: string,
  id?: string,
): Promise<string[]> => {
  if (!userType) userType = UserTypes.Teacher;
  if (!email) email = faker.internet.email();
  if (!id) id = new mongoose.Types.ObjectId().toHexString();

  const session = await global.createSession(sessionData);

  const payload: UserPayload = {
    id,
    email,
    userType,
    sessionId: session.id,
    lang: 'ENG',
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);

  return [`sesstok=${token}; path=/`];
};
