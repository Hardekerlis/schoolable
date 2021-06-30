/** @format */

import request from 'supertest';
import { app } from '../../../app';

const path = '/api/users/admin/register';

it('Returns a 201 on succesfully registering an admin user', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    })
    .expect(201);
});

it('Returns a 400 on client sending an invalid email', async () => {
  await request(app)
    .post(path)
    .send({
      email: 'asdasfgasgas',
      password: 'password',
      confirmPassword: 'password',
    })
    .expect(400);
});

it('Returns a 400 on client sending a non valid password', async () => {
  await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'test',
      confirmPassword: 'test',
    })
    .expect(400);
});

it('Returns a 400 on client sending non matching passwords', async () => {
  await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'notTheSamePassword',
    })
    .expect(400);
});
