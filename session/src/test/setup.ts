/** @format */

import mongoose from 'mongoose';
import faker from 'faker';
import {
  CONFIG,
  winstonTestSetup,
  UserTypes,
  UserPayload,
  Location,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';
import { sign } from 'cookie-signature';
import { nanoid } from 'nanoid';

process.env.JWT_KEY = 'jasdkjlsadkljgdsfakljsfakjlsaf';

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
  password?: string;
}

interface Session {
  user?: User;
  location?: Location;
  creationTimestamp?: string;
  userAgent?: string;
  ip?: string;
}

interface CreateSessionReturn {
  session: SessionDoc;
  user: UserDoc;
}

interface CreatedUserReturn {
  user: UserDoc;
  password: string;
}

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(
        sessionData?: Session,
      ): Promise<[string, SessionDoc, UserDoc]>;
      createUser(userData?: User): Promise<CreatedUserReturn>;
      createSession(sessionData?: Session): Promise<CreateSessionReturn>;
      getFaultyAuthCookie(): Promise<string[]>;
      getUnsignedAuthCookie(): Promise<string[]>;
    }
  }
}

import logger from '../utils/logger';

logger.debug('Setting up tests...');
winstonTestSetup(); // Disables all winston logs

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

global.createUser = async (userData?: User) => {
  let userId, email, name, userType, lang, password;
  if (userData) {
    userId = userData.userId;
    email = userData.email;
    name = userData.name;
    userType = userData.userType;
    lang = userData.lang;
    password = userData.password;
  }
  // let { userId, email, name, userType } = userData!;
  // let userId = userData.userId;

  if (!userId) userId = new mongoose.Types.ObjectId().toHexString().toString();
  if (!email) email = faker.internet.email();
  if (!name)
    name = { first: faker.name.firstName(), last: faker.name.lastName() };
  if (!userType) userType = UserTypes.Teacher;
  if (!lang) lang = 'ENG';
  if (!password) password = nanoid();

  const user = User.build({
    userId,
    email,
    password,
    // @ts-ignore
    name,
    userType,
    lang,
  });

  await user.save();

  return { user, password };
};

global.createSession = async (sessionData: Session) => {
  let user, location, creationTimestamp, userAgent, ip;

  if (sessionData) {
    user = sessionData.user;
    location = sessionData.location;
    creationTimestamp = sessionData.creationTimestamp;
    userAgent = sessionData.userAgent;
    ip = sessionData.ip;
  }

  let userData = await global.createUser(user);
  const actualUser = userData.user;
  if (!ip) ip = '78.73.146.89';
  if (!location) location = geoip.lookup(ip)!;
  if (!creationTimestamp) creationTimestamp = `${+new Date()}`;
  if (!userAgent)
    userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

  const session = Session.build({
    user: actualUser,
    location,
    creationTimestamp,
    userAgent,
    ip,
  });

  await session.save();

  return { session, user: actualUser };
};

global.getFaultyAuthCookie = async () => {
  const { user } = await global.createUser();

  const payload: UserPayload = {
    id: user.userId,
    email: user.email,
    userType: user.userType,
    sessionId: new mongoose.Types.ObjectId().toHexString(),
    lang: user.lang,
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);
  const cookie = `s:${sign(token, process.env.JWT_KEY as string)}`;

  return [`token=${cookie}; path=/`];
};

global.getUnsignedAuthCookie = async () => {
  const { user } = await global.createUser();

  const payload: UserPayload = {
    id: user.userId,
    email: user.email,
    userType: user.userType,
    sessionId: new mongoose.Types.ObjectId().toHexString(),
    lang: user.lang,
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);
  const cookie = `token=${token}; path=/`;

  return [cookie];
};

global.getAuthCookie = async (
  sessionData: Session,
): Promise<[string, SessionDoc, UserDoc]> => {
  const { session, user } = await global.createSession(sessionData);

  const payload: UserPayload = {
    id: user.userId,
    email: user.email,
    userType: user.userType,
    sessionId: session.id,
    lang: 'ENG',
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY as string);
  const cookie = `s:${sign(token, process.env.JWT_KEY as string)}`;

  return [`token=${cookie}; path=/`, session, user];
};
