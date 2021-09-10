/** @format */

import request from 'supertest';
import { app } from '../../../../../app';

const getPath = (course: any, phase: any) => {
  const path = '/api/course/%courseId%/%phaseId%';
  const courseId = course.body.id;
  const phaseId = phase.body.id;

  return path.replace('%courseId%', courseId).replace('%phaseId%', phaseId);
};

it('Returns a 401 if user is not authenticated', async () => {
  // const [cookie] = await global.getAuthCookie();
  // const course = await request(app)
  //   .post('/api/course/create')
  //   .set('Cookie', cookie)
  //   .send({ name: 'Course name' })
  //   .expect(201);
  //
  // const phase = await request(app)
  //   .post(`/api/course/${course.body.id}/createPhase`)
  //   .set('Cookie', cookie)
  //   .send({ name: 'name' })
  //   .expect(201);
  //
  // await request(app).get(getPath(course, phase)).expect(401);
});

it('Returns a 401 if user doesnt have access to phase', async () => {});

it('Returns a 400 if the phase id is not an ObjectId', async () => {});

it('Returns a 200 on successfully fetching phase', async () => {});
