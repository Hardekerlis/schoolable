import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import fs from 'fs';

import { UserTypes } from '@gustafdahl/schoolable-common';

import Course from '../../models/course';
import Phase from '../../models/phase';
import PhaseItem from '../../models/phaseItem';
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
    name: faker.company.companyName(),
  });

  await phase.save();

  return { phaseId, ownerId, parentCourse: courseId };
};

const createPhaseItem = async () => {
  const { phaseId, parentCourse, ownerId } = await createPhase();
  const name = faker.company.companyName();

  const phaseItem = PhaseItem.build({
    name,
    parentPhase: phaseId,
    parentCourse,
    phaseItemId: new mongoose.Types.ObjectId().toHexString(),
  });

  await phaseItem.save();

  return {
    parentPhase: phaseId,
    parentCourse,
    ownerId,
    phaseItem,
  };
};

const path = '/api/submissions/upload';
const filePath = `${__dirname}/testFiles/testpdf.pdf`;
const unallowedFileMimeType = `${__dirname}/testFiles/badFileType.js`;

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .attach('files', fs.readFileSync(filePath), filePath)
    .field('parentPhase', parentPhase)
    .field('parentCourse', parentCourse)
    .field('phaseItemId', phaseItem.phaseItemId)
    .expect(401);
});

it('Returns a 401 if user is not course owner, course admin or course student', async () => {
  const { parentPhase, parentCourse, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhase', parentPhase)
    .field('parentCourse', parentCourse)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(401);
});

it('Returns a 400 if file field is undefined', async () => {
  const { parentPhase, parentCourse, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhase', parentPhase)
    .field('parentCourse', parentCourse)
    .field('phaseItemId', phaseItem.phaseItemId)
    .expect(400);
});

it('Retuns a 400 if phase item id is undefined', async () => {
  const { parentPhase, parentCourse, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhase', parentPhase)
    .field('parentCourse', parentCourse)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(400);
});

it('Returns a 400 if parent phase is undefined', async () => {
  const { parentCourse, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', parentCourse)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(400);
});

it('Returns a 400 if parent course is undefined', async () => {
  const { parentPhase, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhase', parentPhase)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(400);
});

it('Returns a 400 if file type is not allowed', async () => {
  const { parentCourse, parentPhase, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', parentCourse)
    .field('parentPhase', parentPhase)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach(
      'files',
      fs.readFileSync(unallowedFileMimeType),
      unallowedFileMimeType,
    )
    .expect(400);
});

it('Returns a 404 if phase item is not found', async () => {
  const { parentCourse, parentPhase, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', parentCourse)
    .field('parentPhase', parentPhase)
    .field('phaseItemId', new mongoose.Types.ObjectId().toHexString())
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(404);
});

it('Returns a 404 if parent phase is not found', async () => {
  const { parentCourse, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', parentCourse)
    .field('parentPhase', new mongoose.Types.ObjectId().toHexString())
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(404);
});

it('Returns a 404 if parent course is not found', async () => {
  const { parentPhase, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', new mongoose.Types.ObjectId().toHexString())
    .field('parentPhase', parentPhase)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(404);
});

it('Returns a 201 if upload is successful', async () => {
  const { parentCourse, parentPhase, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', parentCourse)
    .field('parentPhase', parentPhase)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(201);
});

it("Returns 'Upload was succesful' in body", async () => {
  const { parentCourse, parentPhase, phaseItem, ownerId } =
    await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourse', parentCourse)
    .field('parentPhase', parentPhase)
    .field('phaseItemId', phaseItem.phaseItemId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(201);

  expect(res.body.message).toEqual('Upload was successful');
});
