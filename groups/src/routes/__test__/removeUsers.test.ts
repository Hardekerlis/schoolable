import request from 'supertest';
import mongoose from 'mongoose';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/groups/remove/';

it(`Has a route handler listening on ${path} for POST requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).post(path).send().expect(401);
});

it('Returns a 400 if a group id is not present in request body', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      users: [],
    })
    .expect(400);
});

it('Returns a 400 if user id is not a valid object id', async () => {
  const { group, cookie } = await global.addToGroup(3);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
      users: ['invalid user id'],
    })
    .expect(400);
});

it('Returns a 400 if users is not an array', async () => {
  const { group, cookie } = await global.addToGroup(3);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
      users: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(400);
});

it("Returns a 404 if user can't be found", async () => {
  const { group, cookie } = await global.addToGroup(3);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
      users: [new mongoose.Types.ObjectId().toHexString()],
    })
    .expect(404);
});

it("Returns a 404 if group can't be found", async () => {
  const { cookie, users } = await global.addToGroup(3);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      groupId: new mongoose.Types.ObjectId().toHexString(),
      users,
    })
    .expect(404);
});

it('Returns a 200 if users are successfully added to group', async () => {
  const { group, cookie, users } = await global.addToGroup(3);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
      users,
    })
    .expect(200);
});

it('Returns group in response body', async () => {
  const { group, cookie, users } = await global.addToGroup(3);

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
      users,
    })
    .expect(200);

  expect(res.body.group.users).not.toContain(users[0]);
  expect(res.body.group.users).not.toContain(users[2]);
});
