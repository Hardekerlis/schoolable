/** @format */

// --- Global variables ---
import mongoose from 'mongoose';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { UserTypes, winstonTestSetup } from '../library';
import Session from '../models/session';

import { app } from '../app';
import User from '../models/user';
import { connect } from '../database/connect';

import { logger } from '../logger/logger';
let adminCookie: any;
// -------------------------

logger.debug('Setting up test...');
winstonTestSetup();

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(type?: UserTypes): Promise<string[]>;
      getAdminAuthCookie(): Promise<string[]>;
    }
  }
}

// The tests timesout if the default timout interval is not changed
jest.setTimeout(600000);

// let mongo: any;
beforeAll(async () => {
  await connect();
});

// Removes all items from the database before each test
beforeEach(async () => {
  adminCookie = undefined;
  await mongoose.connection.dropDatabase();
  await User.createIndexes();
});

// Stops mongo after tests
afterAll(async () => {
  // await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

global.getAdminAuthCookie = async () => {
  const validAdminRegisterData = {
    email: 'test@test.com',
    password: 'password',
    confirmPassword: 'password',
    name: 'John Doe',
  };

  let res = await request(app)
    .post(`/api/admin/register`)
    .send(validAdminRegisterData);

  if (res.body.errors) {
    res = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);
  }

  let cookie = res.get('Set-Cookie');

  return cookie;
};

global.getAuthCookie = async (type?: UserTypes) => {
  if (!type) type = UserTypes.Teacher;
  if (!adminCookie) {
    [adminCookie] = await global.getAdminAuthCookie();
  }

  const random = Math.random();

  const newUser = await request(app)
    .post('/api/admin/users/register')
    .set('Cookie', adminCookie)
    .send({
      email: random + 'test@test.com',
      name: 'John Doe',
      userType: type,
    });

  const res = await request(app)
    .post('/api/login')
    .send({
      email: random + 'test@test.com',
      password: newUser.body.tempPassword,
      userType: type,
    });

  const cookie = res.get('Set-Cookie');
  return cookie;
};
