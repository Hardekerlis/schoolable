import request from 'supertest';
import mongoose from 'mongoose';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/groups/create';

it(`Has a route handler listening on ${path} for POST requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).post(path).send().expect(401);
});

it('Returns a 400 if a group name is not present in request body', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      users: [],
    })
    .expect(400);
});

it('Returns a 400 if there is a space in the name', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: 'group 1',
      users: [],
    })
    .expect(400);
});

it('Returns a 400 if a user id is invalid', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: 'group1',
      users: ['invalid user id'],
    })
    .expect(400);
});

it('Returns a 404 if users array is not found', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: 'group1',
      users: [new mongoose.Types.ObjectId().toHexString()],
    })
    .expect(404);
});

it('Returns a 201 if a group is successfully created', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: 'group1ö',
      users: [],
    })
    .expect(201);
});

it('Returns the new group in response body', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);
  const user = await global.createUser(
    UserTypes.Student,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: 'group1',
      users: [user.id],
    })
    .expect(201);

  expect(res.body.group).toBeDefined();
});
