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
    id: courseId,
  });

  await course.save();

  return { courseId, ownerId, name };
};

const createPhase = async (ownerId?: string) => {
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();
  const phaseId = new mongoose.Types.ObjectId().toHexString();

  const { courseId } = await createCourse(ownerId);

  const phase = Phase.build({
    id: phaseId as string,
    parentCourseId: courseId,
    name: faker.company.companyName(),
  });

  await phase.save();

  return { phaseId, ownerId, parentCourseId: courseId };
};

const createPhaseItem = async () => {
  const { phaseId, parentCourseId, ownerId } = await createPhase();
  const name = faker.company.companyName();

  const phaseItem = PhaseItem.build({
    name,
    parentPhaseId: phaseId,
    parentCourseId,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await phaseItem.save();

  return {
    parentPhaseId: phaseId,
    parentCourseId,
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
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .attach('files', fs.readFileSync(filePath), filePath)
    .field('parentPhaseId', parentPhaseId)
    .field('parentCourseId', parentCourseId)
    .field('phaseItemId', phaseItem.id)
    .expect(401);
});

it('Returns a 401 if user is not course owner, course admin or course student', async () => {
  const { parentPhaseId, parentCourseId, phaseItem } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhaseId', parentPhaseId)
    .field('parentCourseId', parentCourseId)
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(401);
});

it('Returns a 400 if file field is undefined', async () => {
  const { parentPhaseId, parentCourseId, phaseItem, ownerId } =
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
    .field('parentPhaseId', parentPhaseId)
    .field('parentCourseId', parentCourseId)
    .field('phaseItemId', phaseItem.id)
    .expect(400);
});

it('Retuns a 400 if phase item id is undefined', async () => {
  const { parentPhaseId, parentCourseId, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhaseId', parentPhaseId)
    .field('parentCourseId', parentCourseId)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(400);
});

it('Returns a 400 if parent phase is undefined', async () => {
  const { parentCourseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourseId', parentCourseId)
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(400);
});

it('Returns a 400 if parent course is undefined', async () => {
  const { parentPhaseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentPhaseId', parentPhaseId)
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(400);
});

it('Returns a 400 if file type is not allowed', async () => {
  const { parentCourseId, parentPhaseId, phaseItem, ownerId } =
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
    .field('parentCourseId', parentCourseId)
    .field('parentPhaseId', parentPhaseId)
    .field('phaseItemId', phaseItem.id)
    .attach(
      'files',
      fs.readFileSync(unallowedFileMimeType),
      unallowedFileMimeType,
    )
    .expect(400);
});

it('Returns a 404 if phase item is not found', async () => {
  const { parentCourseId, parentPhaseId, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourseId', parentCourseId)
    .field('parentPhaseId', parentPhaseId)
    .field('phaseItemId', new mongoose.Types.ObjectId().toHexString())
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(404);
});

it('Returns a 404 if parent phase is not found', async () => {
  const { parentCourseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourseId', parentCourseId)
    .field('parentPhaseId', new mongoose.Types.ObjectId().toHexString())
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(404);
});

it('Returns a 404 if parent course is not found', async () => {
  const { parentPhaseId, phaseItem, ownerId } = await createPhaseItem();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Student,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('content-type', 'multipart/form-data')
    .set('Cookie', cookie)
    .field('parentCourseId', new mongoose.Types.ObjectId().toHexString())
    .field('parentPhaseId', parentPhaseId)
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(404);
});

it('Returns a 201 if upload is successful', async () => {
  const { parentCourseId, parentPhaseId, phaseItem, ownerId } =
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
    .field('parentCourseId', parentCourseId)
    .field('parentPhaseId', parentPhaseId)
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(201);
});

it("Returns 'Upload was succesful' in body", async () => {
  const { parentCourseId, parentPhaseId, phaseItem, ownerId } =
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
    .field('parentCourseId', parentCourseId)
    .field('parentPhaseId', parentPhaseId)
    .field('phaseItemId', phaseItem.id)
    .attach('files', fs.readFileSync(filePath), filePath)
    .expect(201);

  expect(res.body.message).toEqual('Upload was successful');
});
