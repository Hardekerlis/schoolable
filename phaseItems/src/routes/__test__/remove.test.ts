import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { DateTime } from 'luxon';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/phaseitems/remove';

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
    .post('/api/phaseitems/create')
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

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();

  await request(app)
    .delete(path)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher, temp teacher or admin', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
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
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase: new mongoose.Types.ObjectId().toHexString(),
      parentCourse,
      phaseItemId: phaseItem.id,
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
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse: new mongoose.Types.ObjectId().toHexString(),
      phaseItemId: phaseItem.id,
    })
    .expect(404);
});

it('Returns a 404 if no phase item is found', async () => {
  const { parentPhase, parentCourse, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 400 if parent phase is undefined', async () => {
  const { parentCourse, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(400);
});

it('Returns a 400 if parent course is undefined', async () => {
  const { parentPhase, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      phaseItemId: phaseItem.id,
    })
    .expect(400);
});

it('Returns a 400 if phase item id is undefined', async () => {
  const { parentPhase, parentCourse, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
    })
    .expect(400);
});

it('Returns a 200 if user is of type admin', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(200);
});

it('Returns isUpForDeletion as true if user is of type admin', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(200);

  expect(res.body.phaseItem.deletion.isUpForDeletion).toEqual(true);
});

it('Returns a 200 if course is successfully updated', async () => {
  const { parentPhase, parentCourse, phaseItem, ownerId } =
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
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(200);
});

it('Returns updated phase item if it is updated', async () => {
  const { parentPhase, parentCourse, phaseItem, ownerId } =
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
      parentPhase,
      parentCourse,
      phaseItemId: phaseItem.id,
    })
    .expect(200);

  expect(res.body.phaseItem.deletion.isUpForDeletion).toEqual(true);
});
