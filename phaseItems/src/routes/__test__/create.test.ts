import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/phase/create';

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

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { courseId } = await createCourse();

  await request(app)
    .post(path)
    .send({
      parentCourse: courseId,
      name: faker.company.companyName(),
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const { courseId } = await createCourse();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourse: courseId,
      name: faker.company.companyName(),
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or course admin', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const { courseId } = await createCourse();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourse: courseId,
      name: faker.company.companyName(),
    })
    .expect(401);
});
