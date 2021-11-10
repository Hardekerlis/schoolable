import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/modules/remove';

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

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  const { moduleId, parentCourseId } = await createModule();

  await request(app)
    .delete(path)
    .send({ moduleId, parentCourseId })
    .expect(401);
});

it('Returns a 401 if user is not of type teacher, temp teacher or admin', async () => {
  const { moduleId, parentCourseId } = await createModule();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      moduleId,
      parentCourseId,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner or admin', async () => {
  const { moduleId, parentCourseId } = await createModule();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      moduleId,
      parentCourseId,
    })
    .expect(401);
});

it('Returns a 400 if moduleId is not present in body', async () => {
  const { parentCourseId, cookie } = await createModule();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId,
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('No module id found in body');
});

it('Returns a 400 if parentCourseId is not present in body', async () => {
  const { moduleId, cookie } = await createModule();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      moduleId,
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual(
    'No parent course id found in body',
  );
});

it('Returns a 200 if module is successfully queued for removal', async () => {
  const { moduleId, parentCourseId, cookie } = await createModule();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      moduleId,
      parentCourseId,
    })
    .expect(200);
});

it('Returns the modules with removeAt as a date', async () => {
  const { moduleId, parentCourseId, cookie } = await createModule();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      moduleId,
      parentCourseId,
    })
    .expect(200);

  expect(res.body.module.deletion.isUpForDeletion).toEqual(true);
});

it('Publishes NATS event', async () => {
  const { moduleId, parentCourseId, cookie } = await createModule();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      moduleId,
      parentCourseId,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
