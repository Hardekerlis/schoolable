import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/modules/create';

import { natsWrapper } from '../../utils/natsWrapper';

import Course from '../../models/course';
const createCourse = async (ownerId?: string) => {
  const courseId = new mongoose.Types.ObjectId().toHexString();
  const name = faker.company.companyName();
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();

  const course = Course.build({
    name,
    owner: ownerId,
    id: courseId,
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
      parentCourseId: courseId,
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
      parentCourseId: courseId,
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
      parentCourseId: courseId,
      name: faker.company.companyName(),
    })
    .expect(401);
});

it('Returns a 400 if no course is found', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  await createCourse();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: new mongoose.Types.ObjectId().toHexString(),
      name: faker.company.companyName(),
    })
    .expect(400);
});

it('Returns a 201 if module is created', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    userId,
  );

  const { courseId } = await createCourse(userId);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: courseId,
      name: faker.company.companyName(),
    })
    .expect(201);
});

it('Module is returned in body if it is created', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    userId,
  );

  const { courseId } = await createCourse(userId);

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: courseId,
      name: faker.company.companyName(),
    })
    .expect(201);

  expect(res.body.module).toBeDefined();
});

it('Publishses NATS event', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    userId,
  );

  const { courseId } = await createCourse(userId);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: courseId,
      name: faker.company.companyName(),
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
