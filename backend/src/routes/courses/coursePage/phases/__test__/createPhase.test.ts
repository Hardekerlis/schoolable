/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../app';

const path = '/api/%courseId%/phase';

it('Returns a 401 if user is not authenticated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  await request(app)
    .post(path.replace('%courseId%', res.body.course.id))
    .send({ description: 'This is a phase' })
    .expect(401);
});

it('Returns a 401 if user is not a teacher or admin', async () => {});

it("Returns a 401 if user tries to create a phase inside a course which it doesn't own", async () => {});

it('Returns a 400 if data is wrong');

it("Returns a 400 if user is trying to create a phase for a course that doesn't exist", async () => {});

it('Returns a 201 if a phase is created', async () => {});

it('Returns a phase if it is successfully created', async () => {});
