import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/update';

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
  const phaseId = new mongoose.Types.ObjectId().toHexString();

  const { courseId } = await createCourse(ownerId);

  const phase = Module.build({
    id: phaseId as string,
    parentCourseId: courseId,
    name: faker.company.companyName(),
  });

  await phase.save();

  return { phaseId, ownerId, parentCourseId: courseId };
};

const createModuleItem = async () => {
  const { phaseId, parentCourseId, ownerId } = await createModule();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );
  const name = faker.company.companyName();

  const res = await request(app)
    .post('/api/phases/create')
    .set('Cookie', cookie)
    .send({
      parentModuleId: phaseId,
      name,
      parentCourseId,
    })
    .expect(201);

  return {
    parentModuleId: phaseId,
    parentCourseId,
    ownerId,
    phaseItem: res.body.phaseItem,
  };
};

it(`Has a route handler listening on ${path} for put requests`, async () => {
  const res = await request(app).put(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { parentModuleId, parentCourseId, phaseItem } =
    await createModuleItem();

  await request(app)
    .put(path)
    .send({
      parentModuleId,
      parentCourseId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const { parentModuleId, parentCourseId, phaseItem } =
    await createModuleItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId,
      parentCourseId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or course admin', async () => {
  const { parentModuleId, parentCourseId, phaseItem } =
    await createModuleItem();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId,
      parentCourseId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 404 if parent phase isnt found', async () => {
  const { parentCourseId, phaseItem, ownerId } = await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: new mongoose.Types.ObjectId().toHexString(),
      parentCourseId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 404 if parent course isnt found', async () => {
  const { parentModuleId, phaseItem, ownerId } = await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId,
      parentCourseId: new mongoose.Types.ObjectId().toHexString(),
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 400 if parent phase is undefined', async () => {
  const { parentModuleId, phaseItem, ownerId } = await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 400 if parent course is undefined', async () => {
  const { parentCourseId, phaseItem, ownerId } = await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 400 if phase item id is undefined', async () => {
  const { parentCourseId, parentModuleId, ownerId } = await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 404 if no phase item is found', async () => {
  const { parentCourseId, parentModuleId, ownerId } = await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      parentModuleId,
      phaseItemId: new mongoose.Types.ObjectId().toHexString(),
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 200 if user is of type admin', async () => {
  const { parentCourseId, parentModuleId, phaseItem } =
    await createModuleItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      parentModuleId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);
});

it('Returns updated phase item if user is of type admin', async () => {
  const { parentCourseId, parentModuleId, phaseItem } =
    await createModuleItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      parentModuleId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);

  expect(res.body.phaseItem.name).not.toEqual(phaseItem.name);
});

it('Returns a 200 if course is successfully updated', async () => {
  const { parentCourseId, parentModuleId, phaseItem, ownerId } =
    await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      parentModuleId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);
});

it('Returns updated phase item if it is updated', async () => {
  const { parentCourseId, parentModuleId, phaseItem, ownerId } =
    await createModuleItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      parentModuleId,
      phaseItemId: phaseItem.id,
      name: 'New name',
    })
    .expect(200);

  expect(res.body.phaseItem.name).not.toEqual(phaseItem.name);
});
