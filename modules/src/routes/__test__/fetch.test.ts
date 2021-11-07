import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/modules/fetch';

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

const createModule = async () => {
  const { courseId, ownerId, name } = await createCourse();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .post('/api/modules/create')
    .set('Cookie', cookie)
    .send({ parentCourseId: courseId, name: faker.company.companyName() })
    .expect(201);

  return {
    parentCourseId: courseId,
    module: res.body.module,
    moduleId: res.body.module.id,
    cookie,
  };
};

const getPath = (id?: String) => {
  if (id) return `${path}/${id}`;

  return path;
};

describe('Fetch many modules. Module items are not populated in this case', () => {
  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { parentCourseId } = await createModule();

    await request(app).post(path).send({ parentCourseId }).expect(401);
  });

  it('Returns a 401 if user is not course owner, admins or student', async () => {
    const { parentCourseId } = await createModule();
    const [cookie] = await global.getAuthCookie();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(401);
  });

  it('Returns all modules if user is of type admin', async () => {
    const { parentCourseId } = await createModule();
    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(200);

    expect(res.body.modules.length).toEqual(1);
  });

  it('Returns a 404 if no modules are found', async () => {
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

  it('Returns 0 modules if no modules are accessible to user', async () => {
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

    expect(res.body.modules.length).toEqual(0);
  });

  it('Returns a 200 if modules are found', async () => {
    const { parentCourseId, cookie } = await createModule();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(200);
  });

  it('Returns modules in body if modules are found', async () => {
    const { parentCourseId, cookie } = await createModule();

    const res = await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourseId })
      .expect(200);

    expect(res.body.modules.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Fetch a single module', () => {
  it(`Has a route handler listening on ${getPath(
    'exampleModuleId',
  )} for post requests`, async () => {
    const res = await request(app).post(getPath('exampleModuleId')).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { moduleId, parentCourseId } = await createModule();

    await request(app)
      .post(getPath(moduleId))
      .send({
        parentCourseId,
      })
      .expect(401);
  });

  it('Returns a 404 if no module is found', async () => {
    const { parentCourseId, cookie } = await createModule();
    const moduleId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .post(getPath(moduleId))
      .set('cookie', cookie)
      .send({
        parentCourseId,
      })
      .expect(404);
  });

  it('Returns a 200 if module is found', async () => {
    const { moduleId, parentCourseId, cookie } = await createModule();

    await request(app)
      .post(getPath(moduleId))
      .set('cookie', cookie)
      .send({
        parentCourseId,
      })
      .expect(200);
  });

  it('Module should be present in response body', async () => {
    const { moduleId, parentCourseId, cookie } = await createModule();

    const res = await request(app)
      .post(getPath(moduleId))
      .set('cookie', cookie)
      .send({
        parentCourseId,
      })
      .expect(200);

    expect(res.body.module).toBeDefined();
  });
});
