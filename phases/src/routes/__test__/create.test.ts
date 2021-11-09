import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/create';

import { natsWrapper } from '../../utils/natsWrapper';

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).post(path).send({}).expect(401);
});

it('Returns a 401 if user is not teacher or admin', async () => {
  const { cookie } = await global.getAuthCookie(UserTypes.Student);

  await request(app).post(path).set('Cookie', cookie).send().expect(401);
});

it('Returns a 401 if user is not course owner', async () => {
  const { course, _module } = await global.createModule();
  const { cookie } = await global.getAuthCookie();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(401);
});

it('Returns a 400 if parent course id is not in request body', async () => {
  const { _module, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(400);
});

it('Returns a 400 if parent module id is not in request body', async () => {
  const { course, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      name: faker.company.companyName(),
    })
    .expect(400);
});

it('Returns a 400 if name is not in request body', async () => {
  const { course, _module, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: _module.id,
    })
    .expect(400);
});

it('Returns a 404 if parent course id is not a valid ObjectId', async () => {
  const { _module, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: 'invalid ObjectId',
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(404);
});

it('Returns a 404 if parent module id is not a valid ObjectId', async () => {
  const { course, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: 'Invalid ObjectId',
      name: faker.company.companyName(),
    })
    .expect(404);
});

it('Returns a 404 if no parent course is found', async () => {
  const { _module, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: new mongoose.Types.ObjectId().toHexString(),
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(404);
});

it('Returns a 404 if no parent module is found', async () => {
  const { course, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: new mongoose.Types.ObjectId().toHexString(),
      name: faker.company.companyName(),
    })
    .expect(404);
});

it('Returns a 201 if a phase is created', async () => {
  const { course, _module, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(201);
});

it('Returns the created phase in response body', async () => {
  const { course, _module, cookie } = await global.createModule();

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(201);

  expect(res.body.phase).toBeDefined();
});

it('Publishes NATS event', async () => {
  const { course, _module, cookie } = await global.createModule();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      parentCourseId: course.id,
      parentModuleId: _module.id,
      name: faker.company.companyName(),
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
