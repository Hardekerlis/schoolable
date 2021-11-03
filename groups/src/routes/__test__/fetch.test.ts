import request from 'supertest';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/groups/fetch';

it(`Has a route handler listening on ${path} for GET requests`, async () => {
  const res = await request(app).get(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).get(path).send().expect(401);
});

it('Returns a 400 if a group name is not present in query', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app).get(path).set('Cookie', cookie).send().expect(400);
});

it('Returns a 404 if no group is found', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .get(path + '?name=groupname')
    .set('Cookie', cookie)
    .send()
    .expect(404);
});

it('Returns a 200 if a group is found', async () => {
  const { cookie, group } = await global.addToGroup(5);

  await request(app)
    .get(path + '?name=' + group.name)
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

it('Returns group with users in response body', async () => {
  const { cookie, group } = await global.addToGroup(5);

  const res = await request(app)
    .get(path + '?name=' + group.name)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(res.body.groups[0].users).toHaveLength(5);
});
