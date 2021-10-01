import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/phase/update';

import Course from '../../models/course';
const createCourse = async (ownerId?: string) => {
  const courseId = new mongoose.Types.ObjectId().toHexString();
  const name = faker.company.companyName();
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();

  const course = Course.build({
    name,
    owner: ownerId,
    courseId,
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
    .send({ parentCourse: courseId, name: faker.company.companyName() })
    .expect(201);

  return {
    parentCourse: courseId,
    phase: res.body.phase,
    phaseId: res.body.phase.id,
    cookie,
  };
};

it(`Has a route handler listening on ${path} for put requests`, async () => {
  const res = await request(app).put(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  const { phaseId, parentCourse } = await createPhase();

  await request(app)
    .put(path)
    .send({ parentCourse, phaseId: phaseId, name: 'new name' })
    .expect(401);
});

it('Returns a 401 if user is not of type teacher, temp teacher or admin', async () => {
  const { phaseId, parentCourse } = await createPhase();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ parentCourse, phaseId: phaseId, name: 'new name' })
    .expect(401);
});

it('Returns a 401 if user is not course owner or admin', async () => {
  const { phaseId, parentCourse } = await createPhase();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ parentCourse, phaseId: phaseId, name: 'new name' })
    .expect(401);
});

it('Returns a 200 if phase is successfully updated', async () => {
  const { phaseId, cookie, parentCourse } = await createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ parentCourse, phaseId: phaseId, name: 'new name' })
    .expect(200);
});

it('Returns the updated phase', async () => {
  const { phaseId, cookie, parentCourse } = await createPhase();
  const newName = 'new name';

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ parentCourse, phaseId: phaseId, name: newName })
    .expect(200);

  expect(res.body.phase.name).toEqual(newName);
});
