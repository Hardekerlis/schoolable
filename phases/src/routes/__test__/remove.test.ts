import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/remove';

import { natsWrapper } from '../../utils/natsWrapper';
import logger from '../../utils/logger';

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).delete(path).send({}).expect(401);
});

it('Returns a 401 if user is not teacher or admin', async () => {
  const { cookie } = await global.getAuthCookie(UserTypes.Student);

  await request(app).delete(path).set('Cookie', cookie).send().expect(401);
});

it('Returns a 401 if user is not course owner', async () => {
  const { phase, _module } = await global.createPhase();
  const { cookie } = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: _module.id,
      phaseId: phase.id,
    })
    .expect(401);
});

it('Returns a 400 if parent module id is not in request body', async () => {
  const { cookie, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
    })
    .expect(400);
});

it('Returns a 400 if phase id is not in request body', async () => {
  const { cookie, _module } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: _module.id,
    })
    .expect(400);
});

it('Returns a 400 if a user tries to queue the same phase for deletion twice', async () => {
  const { cookie, _module, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id });

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id })
    .expect(400);
});

it('Returns a 404 if parent module id is not a valid ObjectId', async () => {
  const { cookie, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: 'Not a valid object id',
      phaseId: phase.id,
    })
    .expect(404);
});

it('Returns a 404 if phase id is not a valid ObjectId', async () => {
  const { cookie, _module } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: _module.id,
      phaseId: 'Not a valid object id',
    })
    .expect(404);
});

it('Returns a 404 if no parent module is found', async () => {
  const { cookie, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: new mongoose.Types.ObjectId().toHexString(),
      phaseId: phase.id,
    })
    .expect(404);
});

it('Returns a 404 if not phase is found', async () => {
  const { cookie, _module } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      parentModuleId: _module.id,
      phaseId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 200 if a phase is successfully queued for deletion', async () => {
  const { cookie, _module, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id })
    .expect(200);
});

it('Returns the phase queued for deletion in response body', async () => {
  const { cookie, _module, phase } = await global.createPhase();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id })
    .expect(200);

  expect(res.body.phase).toBeDefined();
});

it('The removeAt key is defined in phase.deletion', async () => {
  const { cookie, _module, phase } = await global.createPhase();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id })
    .expect(200);

  expect(res.body.phase.deletion.removeAt).toBeDefined();
});

it('Publishes NATS event', async () => {
  const { cookie, _module, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Logger is implemented', async () => {
  const { cookie, _module, phase } = await global.createPhase();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ parentModuleId: _module.id, phaseId: phase.id })
    .expect(200);

  expect(logger.info).toHaveBeenCalled();
  expect(logger.debug).toHaveBeenCalled();
});
