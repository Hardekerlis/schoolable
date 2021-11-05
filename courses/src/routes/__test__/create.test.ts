import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

import { natsWrapper } from '../../utils/natsWrapper';

const path = '/api/course/create';

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not logged in', async () => {
  await request(app)
    .post(path)
    .send({ name: faker.company.companyName() })
    .expect(401);
});

it('Returns a 401 if user is not an admin or teacher', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() })
    .expect(401);
});

it('Returns a 400 if no name is supplied', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app).post(path).set('Cookie', cookie).send().expect(400);
});

it('Returns a 200 if a course is successfully created', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() })
    .expect(201);
});

it('coursePage key is defined in course if creation is successful', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() })
    .expect(201);

  expect(res.body.course.coursePage).toBeDefined();
});

it('Publishes NATS event', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
