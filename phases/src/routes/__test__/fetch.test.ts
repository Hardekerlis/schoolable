import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phase/fetch';

import Course from '../../models/course';

const createCourse = async (ownerId?: string) => {
  const courseId = new mongoose.Types.ObjectId().toHexString();
  const name = faker.company.companyName();
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();

  const course = Course.build({
    name,
    owner: ownerId,
    // @ts-ignore
    _id: courseId,
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
    .send({ parentCourseId: courseId, name: faker.company.companyName() })
    .expect(201);

  return {
    parentCourseId: courseId,
    phase: res.body.phase,
    phaseId: res.body.phase.id,
    cookie,
  };
};

const getPath = (id?: String) => {
  if (id) return `${path}/${id}`;

  return path;
};

describe('Fetch many phases. Phase items are not populated in this case', () => {
  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { parentCourseId } = await createPhase();

    await request(app).post(path).send({ parentCourseId }).expect(401);
  });

  it('Returns a 401 if user is not course owner, admins or student', async () => {
    const { parentCourseId } = await createPhase();
    const [cookie] = await global.getAuthCookie();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(401);
  });

  it('Returns all phases if user is of type admin', async () => {
    const { parentCourseId } = await createPhase();
    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(200);

    expect(res.body.phases.length).toEqual(1);
  });

  it('Returns a 404 if no phases are found', async () => {
    const { courseId, ownerId } = await createCourse();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId: courseId })
      .expect(404);
  });

  it('Returns 0 phases if no phases are accessible to user', async () => {
    const { courseId, ownerId } = await createCourse();
    const [cookie] = await global.getAuthCookie(
      UserTypes.Teacher,
      undefined,
      ownerId,
    );

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId: courseId })
      .expect(404);

    expect(res.body.phases.length).toEqual(0);
  });

  it('Returns a 200 if phases are found', async () => {
    const { parentCourseId, cookie } = await createPhase();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(200);
  });

  it('Returns phases in body if phases are found', async () => {
    const { parentCourseId, cookie } = await createPhase();

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(200);

    expect(res.body.phases.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Fetch a single phase', () => {
  it(`Has a route handler listening on ${getPath(
    'examplePhaseId',
  )} for post requests`, async () => {
    const res = await request(app).post(getPath('examplePhaseId')).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { phaseId, parentCourseId } = await createPhase();

    await request(app)
      .post(getPath(phaseId))
      .send({
        parentCourseId,
      })
      .expect(401);
  });

  it('Returns a 404 if no phase is found', async () => {
    const { parentCourseId, cookie } = await createPhase();
    const phaseId = new mongoose.Types.ObjectId();

    await request(app)
      .post(getPath(phaseId))
      .set('cookie', cookie)
      .send({
        parentCourseId,
      })
      .expect(404);
  });

  it('Returns a 200 if phase is found', async () => {
    const { phaseId, parentCourseId, cookie } = await createPhase();

    await request(app)
      .post(getPath(phaseId))
      .set('cookie', cookie)
      .send({
        parentCourseId,
      })
      .expect(200);
  });

  it('Phase should be present in response body', async () => {
    const { phaseId, parentCourseId, cookie } = await createPhase();

    const res = await request(app)
      .post(getPath(phaseId))
      .set('cookie', cookie)
      .send({
        parentCourseId,
      })
      .expect(200);

    expect(res.body.phase).toBeDefined();
  });
});
