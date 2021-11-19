import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

import logger from '../../utils/logger';
import b2 from '../../utils/b2';
import { natsWrapper } from '../../utils/natsWrapper';

const path = '/api/submissions/upload';

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if uploader is not authenticated', async () => {
  const { phase } = await global.createPhase();

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(401);
});

it('Returns a 401 if user is not a student of course', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(401);
});

it('Returns a 401 if user is not a student', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.getAuthCookie(UserTypes.External);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(401);
});

it('Returns a 400 if phase id is undefined in request body', async () => {
  const { cookie } = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(400);
});

it('Returns a 400 if no files are present in request', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .expect(400);
});

it('Returns a 400 if file mime type is not allowed', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  const res = await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.invalid.file(), global.files.invalid.path)
    .expect(400);

  console.log(res.body.errors[0].supportedMimeTypes);
});

it('Returns a 404 if phase id is not a valid ObjectId', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', 'Invalid ObjectId')
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(404);
});

it('Returns a 404 if no phase is found', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', new mongoose.Types.ObjectId().toHexString())
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(404);
});

it('Returns a 201 if file is successfully uploaded', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(201);
});

it('Publishes Nats event', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Logger is implemented', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(201);

  expect(logger.info).toHaveBeenCalled();
  expect(logger.debug).toHaveBeenCalled();
});

it('All the nessecary functions to upload to Backblaze are called', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.addStudent(phase);

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('phaseId', phase.id)
    .attach('files', global.files.valid.file(), global.files.valid.path)
    .expect(201);

  expect(b2.authorize).toHaveBeenCalled();
  expect(b2.getBucket).toHaveBeenCalled();
  expect(b2.getUploadUrl).toHaveBeenCalled();
  expect(b2.uploadFile).toHaveBeenCalled();
});
