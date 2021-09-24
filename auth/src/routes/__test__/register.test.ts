import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/auth/register';

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

interface InvalidUser {
  email: string;
  userType: string;
  name: {
    first: string;
    last: string;
  };
}

const getInvalidUserData = (
  field: string,
  newValue: string | object,
): InvalidUser => {
  let data = getUserData(UserTypes.Teacher);

  (data as any)[field] = newValue;

  return data;
};

it("Returns a 401 if user registering account isn't of type Admin", async () => {
  await global.getAuthCookie(UserTypes.Admin);
  const [teacherCookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', teacherCookie)
    .send(getUserData(UserTypes.Student))
    .expect(401);
});

it('Returns a 400 if email is invalid', async () => {
  const [adminCookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .post(path)
    .set('Cookie', adminCookie)
    .send(getInvalidUserData('email', 'notvalid.email'))
    .expect(400);
});

it('Returns a 400 if first name is not defined', async () => {
  const [adminCookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .post(path)
    .set('Cookie', adminCookie)
    .send(getInvalidUserData('name', { last: 'asdasdsa' }))
    .expect(400);
});

it("Returns a 400 if last name isn't defined", async () => {
  const [adminCookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .post(path)
    .set('Cookie', adminCookie)
    .send(getInvalidUserData('name', { first: 'asdasdsa' }))
    .expect(400);
});

it('Returns a 201 if user is registered', async () => {
  const [adminCookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .post(path)
    .set('Cookie', adminCookie)
    .send(getUserData(UserTypes.Teacher))
    .expect(201);
});
