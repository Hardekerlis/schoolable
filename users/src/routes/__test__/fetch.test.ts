import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/users/fetch';

it(`Has a route handler listening on ${path} for GET requests`, async () => {
  const res = await request(app).get(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).get(path).send().expect(401);
});

it('Returns a 401 if a student tries to fetch students', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .get(path + '?usertype=student')
    .set('Cookie', cookie)
    .send()
    .expect(401);
});

// , async () => {
//   const [cookie] = await global.getAuthCookie(UserTypes.Guardian);
//   await global.getAuthCookie(UserTypes.Student);
//
//   await request(app).get(path + "?usertype=student").set("Cookie", cookie).send().expect(401);
// }
it.todo(
  'Returns a 401 if a guardian tries to fetch students other than assigned students',
);

it.todo('Returns a 401 if students tries to fetch guardians');

it('Returns a 400 if user type is not present in query', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app).get(path).set('Cookie', cookie).send().expect(400);
});

it('Returns a 400 if an invalid user type is supplied', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .get(path + '?usertype=unknown')
    .set('Cookie', cookie)
    .send()
    .expect(400);
});

it('Returns a 200 if users are successfully fetched', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);
  await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .get(path + '?usertype=student')
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

it('Users are found in response body if fetch is successful', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);
  await global.getAuthCookie(UserTypes.Student);
  await global.getAuthCookie(UserTypes.Student);

  const res = await request(app)
    .get(path + '?usertype=student')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(res.body.users).toHaveLength(2);
});
