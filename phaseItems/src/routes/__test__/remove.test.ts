import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { DateTime } from 'luxon';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phaseitem/remove';

import { natsWrapper } from '../../utils/natsWrapper';

import Course from '../../models/course';
import Phase from '../../models/phase';

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

const createPhase = async (ownerId?: string) => {
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();
  const phaseId = new mongoose.Types.ObjectId().toHexString();

  const { courseId } = await createCourse(ownerId);

  const phase = Phase.build({
    id: phaseId as string,
    parentCourseId: courseId,
    name: faker.company.companyName(),
  });

  await phase.save();

  return { phaseId, ownerId, parentCourseId: courseId };
};

const createPhaseItem = async () => {
  const { phaseId, parentCourseId, ownerId } = await createPhase();
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
      parentPhaseId: phaseId,
      name,
      parentCourseId,
    })
    .expect(201);

  return {
    parentPhaseId: phaseId,
    parentCourseId,
    ownerId,
    phaseItem: res.body.phaseItem,
  };
};

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();

  await request(app)
    .delete(path)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner', async () => {
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(401);
});

it('Returns a 404 if parent phase isnt found', async () => {
  const { parentCourseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId: new mongoose.Types.ObjectId().toHexString(),
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(404);
});

it('Returns a 404 if parent course isnt found', async () => {
  const { parentPhaseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId: new mongoose.Types.ObjectId().toHexString(),
      phaseItemId: phaseItem.id,
    })
    .expect(404);
});

it('Returns a 404 if no phase item is found', async () => {
  const { parentPhaseId, parentCourseId, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 400 if parent phase is undefined', async () => {
  const { parentCourseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(400);
});

it('Returns a 400 if parent course is undefined', async () => {
  const { parentPhaseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      phaseItemId: phaseItem.id,
    })
    .expect(400);
});

it('Returns a 400 if phase item id is undefined', async () => {
  const { parentPhaseId, parentCourseId, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
    })
    .expect(400);
});

it('Returns a 200 if user is of type admin', async () => {
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(200);
});

it('Returns isUpForDeletion as true if user is of type admin', async () => {
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(200);

  expect(res.body.phaseItem.deletion.isUpForDeletion).toEqual(true);
});

it('Returns a 200 if course is successfully updated', async () => {
  const { parentPhaseId, parentCourseId, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(200);
});

it('Returns updated phase item if it is updated', async () => {
  const { parentPhaseId, parentCourseId, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(200);

  expect(res.body.phaseItem.deletion.isUpForDeletion).toEqual(true);
});

it('Returns updated phase item if it is updated', async () => {
  const { parentPhaseId, parentCourseId, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhaseId,
      parentCourseId,
      phaseItemId: phaseItem.id,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
