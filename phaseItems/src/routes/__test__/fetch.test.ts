import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phaseitem/fetch';

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
  const parentPhaseId = new mongoose.Types.ObjectId().toHexString();

  const { courseId } = await createCourse(ownerId);

  const phase = Phase.build({
    id: parentPhaseId as string,
    parentCourseId: courseId,
    name: faker.company.companyName(),
  });

  await phase.save();

  return { parentPhaseId, ownerId, parentCourseId: courseId };
};

const createPhaseItem = async () => {
  const { parentPhaseId, parentCourseId, ownerId } = await createPhase();
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
      parentPhaseId,
      name,
      parentCourseId,
    })
    .expect(201);

  return {
    parentPhaseId,
    parentCourseId,
    ownerId,
    phaseItem: res.body.phaseItem,
  };
};

const getPath = (id: String) => {
  return `${path}/${id}`;
};

describe('Fetch many', () => {
  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { parentPhaseId, parentCourseId } = await createPhaseItem();

    await request(app)
      .post(path)
      .send({ parentPhaseId, parentCourseId })
      .expect(401);
  });

  it('Returns a 401 if user is not course owner, admin or student', async () => {
    const { parentPhaseId, parentCourseId } = await createPhaseItem();
    const [cookie] = await global.getAuthCookie();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        parentPhaseId,
        parentCourseId,
      })
      .expect(401);
  });

  it('Returns all phase items if user is of type admin', async () => {
    const { parentPhaseId, parentCourseId, phaseItem } =
      await createPhaseItem();
    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        parentPhaseId,
        parentCourseId,
      })
      .expect(200);

    expect(res.body.phaseItems.length).toBeGreaterThanOrEqual(1);
  });

  it('Returns a 404 if no phase items are found', async () => {
    const { parentPhaseId, parentCourseId, ownerId } = await createPhase();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        parentPhaseId,
        parentCourseId,
      })
      .expect(404);
  });

  it('Returns 0 phase items if no phase items are accessible to user', async () => {
    const { parentPhaseId, parentCourseId, ownerId } = await createPhase();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        parentPhaseId,
        parentCourseId,
      })
      .expect(404);

    expect(res.body.phaseItems.length).toBeGreaterThanOrEqual(0);
  });

  it('Returns a 200 if phase items are found', async () => {
    const { parentPhaseId, parentCourseId, ownerId } = await createPhaseItem();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        parentPhaseId,
        parentCourseId,
      })
      .expect(200);
  });

  it('Returns a phase items in body if any are found', async () => {
    const { parentPhaseId, parentCourseId, ownerId } = await createPhaseItem();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        parentPhaseId,
        parentCourseId,
      })
      .expect(200);

    expect(res.body.phaseItems).toBeDefined();
  });
});

describe('Fetch one', () => {
  it(`Has a route handler listening on ${getPath(
    ':phaseItemId',
  )} for post requests`, async () => {
    const res = await request(app).post(getPath('examplePhaseId')).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { parentPhaseId, parentCourseId, phaseItem } =
      await createPhaseItem();

    await request(app)
      .post(getPath(phaseItem.id))
      .send({ parentPhaseId, parentCourseId })
      .expect(401);
  });

  it('Returns a 401 if user is not course owner, admin or student', async () => {
    const { parentPhaseId, parentCourseId, phaseItem } =
      await createPhaseItem();
    const [cookie] = await global.getAuthCookie();

    await request(app)
      .post(getPath(phaseItem.id))
      .set('Cookie', cookie)
      .send({ parentPhaseId, parentCourseId })
      .expect(401);
  });

  it('Returns phase item if user is of type admin', async () => {
    const { parentPhaseId, parentCourseId, phaseItem } =
      await createPhaseItem();
    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    const res = await request(app)
      .post(getPath(phaseItem.id))
      .set('Cookie', cookie)
      .send({ parentPhaseId, parentCourseId })
      .expect(200);

    expect(res.body.phaseItem).toBeDefined();
  });

  it('Returns a 404 if no phase item is found', async () => {
    const { parentPhaseId, parentCourseId, ownerId } = await createPhase();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    const res = await request(app)
      .post(getPath(new mongoose.Types.ObjectId().toHexString()))
      .set('Cookie', cookie)
      .send({ parentPhaseId, parentCourseId })
      .expect(404);
  });

  it('Phase item is not defined in body if no phase item is found', async () => {
    const { parentPhaseId, parentCourseId, ownerId } = await createPhase();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    const res = await request(app)
      .post(getPath(new mongoose.Types.ObjectId().toHexString()))
      .set('Cookie', cookie)
      .send({ parentPhaseId, parentCourseId })
      .expect(404);

    expect(res.body.phaseItem).not.toBeDefined();
  });

  it('Returns a 200 if a phase item is found', async () => {
    const { parentPhaseId, parentCourseId, phaseItem, ownerId } =
      await createPhaseItem();

    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    await request(app)
      .post(getPath(phaseItem.id))
      .set('Cookie', cookie)
      .send({ parentPhaseId, parentCourseId })
      .expect(200);
  });

  it('Returns phase item in body if an item is found', async () => {
    const { parentPhaseId, parentCourseId, phaseItem, ownerId } =
      await createPhaseItem();

    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    const res = await request(app)
      .post(getPath(phaseItem.id))
      .set('Cookie', cookie)
      .send({ parentPhaseId, parentCourseId })
      .expect(200);

    expect(res.body.phaseItem).toBeDefined();
  });
});
