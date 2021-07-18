/** @format */

import request from 'supertest';
import { CONFIG } from '@schoolable/common';

import { app } from '../../../app';
import { UserTypes } from '../../../utils/userTypes.enum';

const path = '/api/users';

it('Returns a 401 if no auth cookie is present', async () => {
  return await request(app).delete(path).send({}).expect(401);
});

it('Returns a 400 if user id and email is undefined', async () => {
  const cookie = await global.getAuthCookie();

  return await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('Returns a 400 if users email is undefined', async () => {
  const cookie = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/users/register')
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      userType: UserTypes.Teacher,
      name: 'John Doe',
    })
    .expect(201);

  return await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      id: res.body.user.id,
    })
    .expect(400);
});

it('Returns a 400 if user id is undefined', async () => {
  const cookie = await global.getAuthCookie();

  return await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
    })
    .expect(400);
});

it('Returns a 400 if user id is not an ObjectId', async () => {
  const cookie = await global.getAuthCookie();

  return await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      id: 'thisisid',
    })
    .expect(400);
});

it('Returns a 400 if no user was found to delete', async () => {
  const cookie = await global.getAuthCookie();

  return await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      id: '60ed5f8a9e30d102ee95a84b',
    })
    .expect(400);
});

it('Returns a 204 if user was successfully deleted', async () => {
  const cookie = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/users/register')
    .set('Cookie', cookie)
    .send({
      email: 'test@test.com',
      userType: UserTypes.Teacher,
      name: 'John Doe',
    })
    .expect(201);

  const { email, id } = res.body.user;

  return await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      email,
      id,
    })
    .expect(200);
});
