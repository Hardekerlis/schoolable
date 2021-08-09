/** @format */

import mongoose from 'mongoose';
import request from 'supertest';
import { UserTypes } from '@schoolable/common';

import { app } from '../app';
import User from '../models/user';
import { connect } from '../database/connect';

import { winstonTestSetup } from '@schoolable/common';

import { logger } from '../logger/logger';
logger.debug('Setting up test...');
winstonTestSetup();

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): Promise<string[]>;
      getAdminAuthCookie(): Promise<string[]>;
    }
  }
}

// The tests timesout if the default timout interval is not changed
jest.setTimeout(600000);

// let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  await connect();
});

// Removes all items from the database before each test
beforeEach(async () => {
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

  const cookie = res.get('Set-Cookie');

  return cookie;
};

global.getAuthCookie = async () => {
  const [adminCookie] = await global.getAdminAuthCookie();

  const newUser = await request(app)
    .post('/api/admin/users/register')
    .set('Cookie', adminCookie)
    .send({
      email: 'test@test.com',
      name: 'John Doe',
      userType: UserTypes.Teacher,
    });

  const res = await request(app).post('/api/login').send({
    email: 'test@test.com',
    password: newUser.body.tempPassword,
    userType: UserTypes.Teacher,
  });

  const cookie = res.get('Set-Cookie');

  return cookie;
};
