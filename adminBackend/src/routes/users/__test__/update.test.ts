/** @format */

import request from 'supertest';
import { CONFIG } from '@schoolable/common';
import faker from 'faker';

import { app } from '../../../app';
import { UserTypes } from '../../../utils/userTypes.enum';

const path = '/api/users';

it('Returns a 401 if no auth cookie is present', async () => {
  return await request(app).put(path).send({}).expect(401);
});

it('Returns a 404 if no user is found', async () => {
  const cookie = await global.getAuthCookie();
  return await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      id: '60ed5f8a9e30d102ee95a84b',
      email: faker.internet.email(),
      userType: UserTypes.Teacher,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    })
    .expect(404);
});

it('Returns a 400 if all required fields for a user are not present', async () => {
  const cookie = await global.getAuthCookie();

  return await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('Returns a 204 and the updated user if the update was successful', async () => {
  const cookie = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/users/register')
    .set('Cookie', cookie)
    .send({
      email: faker.internet.email(),
      userType: UserTypes.Teacher,
      name: faker.name.firstName() + ' ' + faker.name.lastName(),
    })
    .expect(201);

  const { user } = res.body;

  const updated = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      id: user.id,
      email: 'newemail@test.com',
      userType: user.userType,
      name: 'John Doe',
    })
    .expect(200);

  expect(updated.body.user.name).toEqual('John Doe');
});
