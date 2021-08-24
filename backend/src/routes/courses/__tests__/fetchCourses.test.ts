/** @format */

import request from 'supertest';
import { app } from '../../../app';

const path = '/api/course';

it("Returns a 401 if user isn't signed in", async () => {
  await request(app).get(path).send({}).expect(401);
});

it('Returns a 400 if no courses belongs to user', async () => {
  await request(app)
    .post('/api/course/create')
    .set('Cookie', await global.getAuthCookie())
    .send({ name: 'Math' })
    .expect(201);

  await request(app)
    .get(path)
    .set('Cookie', await global.getAuthCookie())
    .send()
    .expect(400);
});

it('Returns a 200 if user has courses registered to it', async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app).get(path).set('Cookie', cookie).send().expect(200);
});

it('Returns 2 course if user has 2 registered courses to it', async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'English' })
    .expect(201);

  const res = await request(app)
    .get(path)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(res.body.courses).toHaveLength(2);
});
