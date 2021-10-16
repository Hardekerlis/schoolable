import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/phaseitem/create';

import Course from '../../models/course';
import Phase from '../../models/phase';
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

const createPhase = async (ownerId?: string) => {
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();
  const phaseId = new mongoose.Types.ObjectId().toHexString();

  const { courseId } = await createCourse(ownerId);

  const phase = Phase.build({
    phaseId: phaseId as string,
    parentCourse: courseId,
    name: faker.company.companyName(),
  });

  await phase.save();

  return { phaseId, ownerId, parentCourse: courseId };
};

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { parentCourse, phaseId } = await createPhase();

  await request(app)
    .post(path)
    .send({
      name: faker.company.companyName(),
      parentCourse,
      phaseId,
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const { parentCourse, phaseId } = await createPhase();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourse,
      phaseId,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or course admin', async () => {
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  const { parentCourse, phaseId } = await createPhase();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      name: faker.company.companyName(),
      parentCourse,
      phaseId,
    })
    .expect(401);
});

it('Returns a 400 if name is undefined', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourse, phaseId } = await createPhase(ownerId);
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      phaseId,
    })
    .expect(400);
});

it('Returns a 400 if parentCourse is undefined', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { phaseId } = await createPhase(ownerId);
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
      phaseId,
    })
    .expect(400);
});

it('Returns a 400 if phaseId is undefined', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourse } = await createPhase(ownerId);
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
      parentCourse,
    })
    .expect(400);
});

it('Returns a 404 if phaseId is not a valid object id', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourse } = await createPhase(ownerId);
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
      parentCourse,
      phaseId: 'notvalidobjectid',
    })
    .expect(404);
});

it('Returns a 404 if parentCourse is not a valid object id', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { phaseId } = await createPhase(ownerId);
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
      parentCourse: 'notvalidobjectid',
      phaseId,
    })
    .expect(404);
});

it('Returns a 404 if no parentCourse is found', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { phaseId } = await createPhase(ownerId);
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
      parentCourse: new mongoose.Types.ObjectId().toHexString(),
      phaseId,
    })
    .expect(404);
});

it('Returns a 404 if no phase with supplied id is found', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourse } = await createPhase(ownerId);
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
      parentCourse,
      phaseId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 201 if phase item is successfully created', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourse, phaseId } = await createPhase(ownerId);
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
      parentCourse,
      phaseId,
    })
    .expect(201);
});

it('Returns phase item in response body if it successfully created', async () => {
  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const { parentCourse, phaseId } = await createPhase(ownerId);
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
      parentCourse,
      phaseId,
    })
    .expect(201);

  expect(res.body.phaseItem).toBeDefined();
});
