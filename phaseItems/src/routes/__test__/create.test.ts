import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/create';

import { natsWrapper } from '../../utils/natsWrapper';

import Course from '../../models/course';
import Module from '../../models/module';
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

const createModule = async (ownerId?: string) => {
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();
  const parentModuleId = new mongoose.Types.ObjectId().toHexString();

  const { courseId } = await createCourse(ownerId);

  const phase = Module.build({
    id: parentModuleId as string,
    parentCourseId: courseId,
    name: faker.company.companyName(),
  });

  await phase.save();

  return { parentModuleId, ownerId, parentCourseId: courseId };
};

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { parentCourseId, parentModuleId } = await createModule();

  await request(app)
    .post(path)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId,
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const { parentCourseId, parentModuleId } = await createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or course admin', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const { parentCourseId, parentModuleId } = await createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId,
    })
    .expect(401);
});

it('Returns a 400 if name is undefined', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId, parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      parentModuleId,
    })
    .expect(400);
});

it('Returns a 400 if parentCourseId is undefined', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentModuleId,
    })
    .expect(400);
});

it('Returns a 400 if parentModuleId is undefined', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
    })
    .expect(400);
});

it('Returns a 404 if parentModuleId is not a valid object id', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId: 'notvalidobjectid',
    })
    .expect(404);
});

it('Returns a 404 if parentCourseId is not a valid object id', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId: 'notvalidobjectid',
      parentModuleId,
    })
    .expect(404);
});

it('Returns a 404 if no parentCourseId is found', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId: new mongoose.Types.ObjectId().toHexString(),
      parentModuleId,
    })
    .expect(404);
});

it('Returns a 404 if no phase with supplied id is found', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 201 if phase item is successfully created', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId, parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId,
    })
    .expect(201);
});

it('Returns phase item in response body if it successfully created', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId, parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId,
    })
    .expect(201);

  expect(res.body.phaseItem).toBeDefined();
});

it('Publishes NATS event', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourseId, parentModuleId } = await createModule(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourseId,
      parentModuleId,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
