/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../app';
import { UserTypes } from '../../../../../library';

const path = '/api/course/%courseId%/phase';

it('Returns a 401 if user is not authenticated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .send({ name: 'First phase' })
    .expect(401);
});

it('Returns a 401 if user is not a teacher or admin', async () => {
  const [studentCookie] = await global.getAuthCookie(UserTypes.Student);
  const [teacherCookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', teacherCookie)
    .send({
      name: 'Math',
    });

  await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .set('Cookie', studentCookie)
    .send({
      name: 'First phase',
    })
    .expect(401);
});

it("Returns a 401 if user tries to create a phase inside a course which it doesn't own", async () => {
  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', await global.getAuthCookie())
    .send({
      name: 'Math',
    });

  await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .set('Cookie', await global.getAuthCookie())
    .send({
      name: 'First phase',
    })
    .expect(401);
});

it('Returns a 400 if data is wrong', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({
      name: 'Math',
    });

  await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it("Returns a 404 if user is trying to create a phase for a course that doesn't exist", async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .post(
      path.replace(
        '%courseId%',
        mongoose.Types.ObjectId() as unknown as string,
      ),
    )
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(404);
});

it('Returns a 201 if a phase is created', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({
      name: 'Math',
    });

  await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({
      name: 'First phase',
    })
    .expect(201);
});

it('Returns a phase if it is successfully created', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({
      name: 'Math',
    });

  const phaseRes = await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({
      name: 'First phase',
    })
    .expect(201);

  expect(phaseRes.body.phase).toHaveProperty('name');
});
