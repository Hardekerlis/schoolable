/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../app';
import { UserTypes } from '../../../../../library';

const path = '/api/course/%courseId%/%phaseId%';

it('Test todo', async () => {
  expect('test.todo');
});

// it('Returns a 401 if user is not authenticated', async () => {
//   const [cookie] = await global.getAuthCookie();
//
//   const courseRes = await request(app)
//     .post('/api/course/create')
//     .set('Cookie', cookie)
//     .send({
//       name: 'Math',
//     })
//     .expect(201);
//
//   const phaseRes = await request(app)
//     .post(`/api/course/${courseRes.body.course.id}/createPhase`)
//     .set('Cookie', cookie)
//     .send({
//       name: 'Phase 1',
//     });
// });
