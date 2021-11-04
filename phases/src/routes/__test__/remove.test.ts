import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phase/remove';

import Course from '../../models/course';

const createCourse = async (ownerId?: string) => {
  const courseId = new mongoose.Types.ObjectId().toHexString();
  const name = faker.company.companyName();
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();

  const course = Course.build({
    name,
    owner: ownerId,
    // @ts-ignore
    _id: courseId,
  });

  await course.save();

  return { courseId, ownerId, name };
};

const createPhase = async () => {
  const { courseId, ownerId, name } = await createCourse();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .post('/api/phase/create')
    .set('Cookie', cookie)
    .send({ parentCourseId: courseId, name: faker.company.companyName() })
    .expect(201);

  return {
    parentCourseId: courseId,
    phase: res.body.phase,
    phaseId: res.body.phase.id,
    cookie,
  };
};

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  const { phaseId, parentCourseId } = await createPhase();

  await request(app).delete(path).send({ phaseId, parentCourseId }).expect(401);
});

it('Returns a 401 if user is not of type teacher, temp teacher or admin', async () => {
  const { phaseId, parentCourseId } = await createPhase();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      phaseId,
      parentCourseId,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or admin', async () => {
  const { phaseId, parentCourseId } = await createPhase();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      phaseId,
      parentCourseId,
    })
    .expect(401);
});

it('Returns a 400 if phaseId is not present in body', async () => {
  const { parentCourseId, cookie } = await createPhase();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('No phase id found in body');
});

it('Returns a 400 if parentCourseId is not present in body', async () => {
  const { phaseId, cookie } = await createPhase();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      phaseId,
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual(
    'No parent course id found in body',
  );
});

it('Returns a 200 if phase is successfully queued for removal', async () => {
  const { phaseId, parentCourseId, cookie } = await createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      phaseId,
      parentCourseId,
    })
    .expect(200);
});

it('Returns the phases with removeAt as a date', async () => {
  const { phaseId, parentCourseId, cookie } = await createPhase();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      phaseId,
      parentCourseId,
    })
    .expect(200);

  expect(res.body.phase.deletion.isUpForDeletion).toEqual(true);
});
