/** @format */

import request from 'supertest';
import { CONFIG } from '@schoolable/common';

import { app } from '../../../app';
import { UserTypes } from '../../../utils/userTypes.enum';

const path = '/api/users/register';

it('Returns a 401 if no auth cookie is present', async () => {
  return await request(app).post(path).send({}).expect(401);
});

it('Returns a 400 if no data is supplied', async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('Returns a 400 if email is invalid', async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'notvalidemail.com',
    })
    .expect(400);
});

it('Returns a 400 if userType is undefined', async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
    })
    .expect(400);
});

it("Returns a 400 if the specified user type doesn't exist", async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      userType: 'asdasda',
    })
    .expect(400);
});

it('Returns a 400 if name is undefined', async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      userType: UserTypes.Teacher,
    })
    .expect(400);
});

it('Returns a 400 if name isnt a string', async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      userType: UserTypes.Teacher,
      name: { first: 'asd', last: 'asdas' },
    })
    .expect(400);
});

it('Returns a 201 and user object if user is successfully registered', async () => {
  const cookie = await global.getAuthCookie();
  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      userType: UserTypes.Teacher,
      name: 'John Doe',
    })
    .expect(201);

  expect(res.body).toBeDefined();
});

it('userType is student if userType is set to student', async () => {
  const cookie = await global.getAuthCookie();
  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      email: 'test2@test.com',
      userType: UserTypes.Student,
      name: 'John Doe',
    })
    .expect(201);

  expect(res.body.user).toMatchObject({ userType: 'student' });
});
