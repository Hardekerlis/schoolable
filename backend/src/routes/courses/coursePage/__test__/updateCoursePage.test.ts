/** @format */

import request from 'supertest';
import { app } from '../../../../app';

const path = '/api/coursePage';

it("Returns a 401 if user trying to edit coursePage isn't signed in", async () => {
  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', await global.getAuthCookie())
    .send({
      name: 'Math',
    })
    .expect(201);

  await request(app)
    .put(path)
    .send({
      id: res.body.course.coursePage,
    })
    .expect(401);
});

it('Returns 401 if user is trying to update a course which it doesnt own', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', await global.getAuthCookie())
    .send({
      name: 'Math',
    })
    .expect(201);

  await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({
      name: 'English',
    })
    .expect(201);

  await request(app)
    .patch(path)
    .set('Cookie', cookie)
    .send({
      id: res.body.course.id,
      name: 'Science',
    })
    .expect(401);
});

it("Returns a 400 if id isn't an ObjectId", async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({
      name: 'English',
    })
    .expect(201);

  await request(app)
    .patch(path)
    .set('Cookie', cookie)
    .send({
      id: 'notvalidid',
      name: 'Science',
    })
    .expect(400);
});

it('Returns a 200 on succesful update', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({
      name: 'English',
    })
    .expect(201);

  await request(app)
    .patch(path)
    .set('Cookie', cookie)
    .send({
      id: res.body.course.id,
      name: 'Physics',
      locked: false,
    })
    .expect(200);
});
