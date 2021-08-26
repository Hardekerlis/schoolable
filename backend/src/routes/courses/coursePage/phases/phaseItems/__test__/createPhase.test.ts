/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../../app';
import { UserTypes } from '../../../../../../library';

const path = '/api/course/%courseId%/%phaseItem%';

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
