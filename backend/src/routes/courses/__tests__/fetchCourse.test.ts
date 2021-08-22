/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { UserTypes } from '../../../library';
import { app } from '../../../app';

const path = '/api/course';

it("Returns a 401 if user isn't signed in", async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app).get(`${path}/${res.body.course.id}`).send({}).expect(401);
});

it('Returns a 401 if user doesnt have access to course', async () => {
  const [cookie] = await global.getAuthCookie();
  const [studentCookie] = await global.getAuthCookie(UserTypes.Student);

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app)
    .get(`${path}/${res.body.course.id}`)
    .set('Cookie', await global.getAuthCookie())
    .send()
    .expect(401);
});

it('Returns a 404 if no course with the supplied id is found', async () => {
  const [cookie] = await global.getAuthCookie();
  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app)
    .get(`${path}/${mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie)
    .send()
    .expect(401);
});

it('Returns a 404 if id is not a valid ObjectId', async () => {
  const [cookie] = await global.getAuthCookie();
  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app)
    .get(`${path}/notvalidid`)
    .set('Cookie', cookie)
    .send()
    .expect(404);
});

it('Returns a 200 if a course was found', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  await request(app)
    .get(`${path}/${mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

it('CoursePage is populated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  const courseRes = await request(app)
    .get(`${path}/${mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(courseRes.body.course.coursePage).toHaveProperty('description');
});
