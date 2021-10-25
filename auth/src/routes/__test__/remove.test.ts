import request from 'supertest';
import faker from 'faker';
import { UserTypes, UserPayload } from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { app } from '../../app';
import User from '../../models/user';
import UserSettings from '../../models/userSettings';

const path = '/api/auth/remove';

interface ValidUser {
  email: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
}

const getUserData = (userType: UserTypes): ValidUser => {
  return {
    email: faker.internet.email(),
    userType: userType,
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };
};

interface RegisteredUser {
  email: string;
  password: string;
  id: string;
}

const registerUser = async (userType: UserTypes): Promise<RegisteredUser> => {
  const adminCookie = global.adminCookie;
  const path = '/api/auth/register';

  const { body } = await request(app)
    .post(path)
    // @ts-ignore
    .set('Cookie', adminCookie)
    .send(getUserData(userType))
    .expect(201);

  const { user, tempPassword } = body;

  const { email, id } = user;

  return { email, password: tempPassword, id };
};

it('Returns a 401 if user is not an admin', async () => {
  const [teacherCookie] = await global.getAuthCookie(UserTypes.Teacher);

  const { id } = await registerUser(UserTypes.Teacher);

  await request(app)
    .delete(path)
    .set('Cookie', teacherCookie)
    .send({ id })
    .expect(401);
});

it('Returns a 405 if an admin is trying to remove the last admin account', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  // @ts-ignore
  const token = global.adminCookie
    .split(' ')[0]
    .replace('token=', '')
    .replace(';', '');

  const payload = jwt.verify(
    token,
    process.env.JWT_KEY as string,
  ) as UserPayload;

  await request(app)
    .delete(path)
    // @ts-ignore
    .set('Cookie', global.adminCookie)
    .send({ id: payload.id })
    .expect(405);
});

it('Returns a 400 if no user is found to delete', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      id: mongoose.Types.ObjectId(),
    })
    .expect(400);
});

it('Returns a 200 if account is successfully removed', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  const { id } = await registerUser(UserTypes.Student);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ id })
    .expect(200);
});
