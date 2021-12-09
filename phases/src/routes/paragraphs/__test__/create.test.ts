import request from 'supertest';
import faker from 'faker';
import { app } from '../../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/paragraphs/create';

import { natsWrapper } from '../../../utils/natsWrapper';
import logger from '../../../utils/logger';

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
  const { phase, paragraphData } = await global.getParagraphData();
  const { cookie } = await global.getAuthCookie();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(401);
});

it('Returns a 400 if phaseId is not in request body', async () => {
  const { paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(400);
});

it('Returns a 400 if content is undefined in request body', async () => {
  const { phase, paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      type: paragraphData.type,
    })
    .expect(400);
});

it('Returns a 400 if type is undefined in request body', async () => {
  const { phase, paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      content: paragraphData.content,
    })
    .expect(400);
});

it('Returns a 400 if type is not a valid paragraph type', async () => {
  const { phase, paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      content: paragraphData.content,
      type: 'Invalid type',
    })
    .expect(400);
});

it('Returns a 404 if phaseId is not a valid ObjectId', async () => {
  const { paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: 'Invalid phase id',
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(404);
});

it('Returns a 404 if no phase is found', async () => {
  const { paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: new mongoose.Types.ObjectId().toHexString(),
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(404);
});

it('Returns a 201 if a paragraph is created', async () => {
  const { phase, paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(201);
});

it('Returns the created paragraph in response body', async () => {
  const { phase, paragraphData, cookie } = await global.getParagraphData();

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(201);

  expect(res.body.paragraph).toEqual(paragraphData);
});

it('Logger is implemented', async () => {
  const { phase, paragraphData, cookie } = await global.getParagraphData();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phaseId: phase.id,
      content: paragraphData.content,
      type: paragraphData.type,
    })
    .expect(201);

  expect(logger.info).toHaveBeenCalled();
  expect(logger.debug).toHaveBeenCalled();
});
