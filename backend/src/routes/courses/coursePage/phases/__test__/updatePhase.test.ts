/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../app';
import { UserTypes } from '../../../../../library';

const path = '/api/course/%courseId%/%phaseId%';
const createPhasePath = '/api/course/%courseId%/createPhase';

it('Returns a 401 if user is not authenticated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'English' });

  const newPhaseRes = await request(app)
    .post(createPhasePath.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({ name: 'First Phase' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', newPhaseRes.body.phase.id),
    )
    .send({ description: 'This is a updated description' })
    .expect(401);
});

it('Returns a 401 if user trying to edit phase is not teacher or admin', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'English' });

  const newPhaseRes = await request(app)
    .post(createPhasePath.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({ name: 'First Phase' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', newPhaseRes.body.phase.id),
    )
    .set('Cookie', await global.getAuthCookie(UserTypes.Student))
    .send({ description: 'This is a updated description' })
    .expect(401);
});

it("Returns a 401 if user is trying to edit a phase inside a course it doesn't own", async () => {
  const [teacher1] = await global.getAuthCookie();
  const [teacher2] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', teacher1)
    .send({ name: 'English' });

  const newPhaseRes = await request(app)
    .post(createPhasePath.replace('%courseId%', res.body.course.id))
    .set('Cookie', teacher1)
    .send({ name: 'First Phase' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', newPhaseRes.body.phase.id),
    )
    .set('Cookie', teacher2)
    .send({ description: 'This is a updated description' })
    .expect(401);
});

it("Returns a 404 if user is trying to edit a phase that doesn't exist", async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'English' });

  const newPhaseRes = await request(app)
    .post(createPhasePath.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({ name: 'First Phase' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', mongoose.Types.ObjectId() as unknown as string),
    )
    .set('Cookie', cookie)
    .send({ description: 'This is a updated description' })
    .expect(404);
});

it('Returns a 200 if phase is successfully updated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'English' });

  const newPhaseRes = await request(app)
    .post(createPhasePath.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({ name: 'First Phase' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', newPhaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({ description: 'This is a updated description' })
    .expect(200);
});

it('Returns the updated phase', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'English' });

  const newPhaseRes = await request(app)
    .post(createPhasePath.replace('%courseId%', res.body.course.id))
    .set('Cookie', cookie)
    .send({ name: 'First Phase' })
    .expect(201);

  expect(newPhaseRes.body.phase.description).toEqual('');

  const updateRes = await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', newPhaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({ description: 'This is a updated description' })
    .expect(200);

  expect(updateRes.body.phase.description).toEqual(
    'This is a updated description',
  );
});
