/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '../../../library';
import faker from 'faker';
import { app } from '../../../app';

const path = '/api/course/create';

it("Returns a 401 if user isn't signed in", async () => {
  await request(app).post(path).send({}).expect(401);
});

it("Returns a 401 if user isn't a teacher or admin", async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app).post(path).set('Cookie', cookie).send({}).expect(401);
});

it('Returns a 400 if no data is specified', async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app).post(path).set('Cookie', cookie).send({}).expect(400);
});

it('Returns a 400 if name is not defined', async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app).post(path).set('Cookie', cookie).send({}).expect(400);
});

it('Returns a 201 if name is supplied', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);
});

it("Course name is equal to 'Math' if entered name is 'Math'", async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  expect(res.body.course.name).toEqual('Math');
});
