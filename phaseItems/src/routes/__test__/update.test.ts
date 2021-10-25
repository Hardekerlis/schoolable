import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phaseitem/update';

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

const createPhaseItem = async () => {
  const { phaseId, parentCourse, ownerId } = await createPhase();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );
  const name = faker.company.companyName();

  const res = await request(app)
    .post('/api/phaseitem/create')
    .set('Cookie', cookie)
    .send({
      phaseId,
      name,
      parentCourse,
    })
    .expect(201);

  return {
    parentPhase: phaseId,
    parentCourse,
    ownerId,
    phaseItem: res.body.phaseItem,
  };
};

it(`Has a route handler listening on ${path} for put requests`, async () => {
  const res = await request(app).put(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();

  await request(app)
    .put(path)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or course admin', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 404 if parent phase isnt found', async () => {
  const { parentCourse, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentPhase: new mongoose.Types.ObjectId().toHexString(),
      parentCourse,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 404 if parent course isnt found', async () => {
  const { parentPhase, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse: new mongoose.Types.ObjectId().toHexString(),
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 400 if parent phase is undefined', async () => {
  const { parentPhase, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 400 if parent course is undefined', async () => {
  const { parentCourse, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 400 if phase item id is undefined', async () => {
  const { parentCourse, parentPhase, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 404 if no phase item is found', async () => {
  const { parentCourse, parentPhase, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      parentPhase,
      phaseItemId: new mongoose.Types.ObjectId().toHexString(),
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 200 if user is of type admin', async () => {
  const { parentCourse, parentPhase, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      parentPhase,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);
});

it('Returns updated phase item if user is of type admin', async () => {
  const { parentCourse, parentPhase, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      parentPhase,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);

  expect(res.body.phaseItem.name).not.toEqual(phaseItem.name);
});

it('Returns a 200 if course is successfully updated', async () => {
  const { parentCourse, parentPhase, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      parentPhase,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);
});

it('Returns updated phase item if it is updated', async () => {
  const { parentCourse, parentPhase, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      parentPhase,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);

  expect(res.body.phaseItem.name).not.toEqual(phaseItem.name);
});
