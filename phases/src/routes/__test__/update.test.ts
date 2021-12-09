import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes, HandInTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/update';

import { natsWrapper } from '../../utils/natsWrapper';
import logger from '../../utils/logger';

it(`Has a route handler listening on ${path} for put requests`, async () => {
  const res = await request(app).put(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).put(path).send({}).expect(401);
});

it('Returns a 401 if user is not teacher, temp teacher or admin', async () => {
  const { cookie } = await global.getAuthCookie(UserTypes.Student);

  await request(app).put(path).set('Cookie', cookie).send().expect(401);
});

it('Returns a 401 if user is not owner or course admin', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.getAuthCookie();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
    })
    .expect(401);
});

it('Returns a 400 if phase id is undefined in request body', async () => {
  const { cookie } = await global.createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      name: 'New name',
    })
    .expect(400);
});

it('Returns a 404 if phase id is a invalid ObjectId', async () => {
  const { cookie } = await global.createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: 'Invalid ObjectId',
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 404 if phase is not found', async () => {
  const { cookie } = await global.createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: new mongoose.Types.ObjectId().toHexString(),
      name: 'New name',
    })
    .expect(404);
});

it('Returns a 200 if phase is successfully updated', async () => {
  const { cookie, phase } = await global.createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
    })
    .expect(200);
});

it('Returns the updated phase in response body', async () => {
  const { cookie, phase } = await global.createPhase();

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
    })
    .expect(200);

  expect(res.body.phase.name).not.toEqual(phase.name);
});

it('Returns the updated phase page if it is to be updated', async () => {
  const { cookie, phase } = await global.createPhase();

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
      page: {
        handInTypes: HandInTypes.File,
      },
    })
    .expect(200);

  expect(res.body.phase.page.handInTypes[0]).toEqual(HandInTypes.File);
});

it('Parent module is not defined in phase in response body', async () => {
  const { cookie, phase } = await global.createPhase();

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
      page: {
        handInButton: HandInTypes.File,
      },
    })
    .expect(200);

  expect(res.body.phase.parentModule).not.toBeDefined();
});

it('Publishes NATS event', async () => {
  const { cookie, phase } = await global.createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Logger is implemented', async () => {
  const { cookie, phase } = await global.createPhase();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      name: 'New name',
    })
    .expect(200);

  expect(logger.info).toHaveBeenCalled();
  expect(logger.debug).toHaveBeenCalled();
});
