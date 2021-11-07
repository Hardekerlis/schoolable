import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import fs from 'fs';

import { UserTypes } from '@gustafdahl/schoolable-common';

import Course from '../../models/course';
import File from '../../models/file';

import b2 from '../../utils/b2';

const createCourse = async (ownerId?: string) => {
  const courseId = new mongoose.Types.ObjectId().toHexString();
  if (!ownerId) ownerId = new mongoose.Types.ObjectId().toHexString();

  const course = Course.build({
    owner: ownerId,
    id: courseId,
  });

  await course.save();

  return { courseId, ownerId };
};

const path = '/api/files/upload';

const filePath = `${__dirname}/testFiles/testpdf.pdf`;
const unallowedFileMimeType = `${__dirname}/testFiles/badFileType.js`;

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  await request(app)
    .post(path)
    .set('Content-Type', 'multipart/form-data')
    .attach('file', fs.readFileSync(filePath), filePath)
    .expect(401);
});

it('Returns a 401 if a user tries to upload a file to a course without permissions', async () => {
  const { courseId } = await createCourse();
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('cookie', cookie)
    .set('Content-Type', 'multipart/form-data')
    .field('accessType', 'course')
    .field('accessIds', JSON.stringify([courseId]))
    .attach('file', fs.readFileSync(filePath), filePath)
    .expect(401);
});

it('Returns a 400 if file is not an allowed mime type', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  const res = await request(app)
    .post(path)
    .set('Content-Type', 'multipart/form-data')
    .set('cookie', cookie)
    .attach(
      'file',
      fs.readFileSync(unallowedFileMimeType),
      unallowedFileMimeType,
    )
    .expect(400);

  expect(res.body.errors[0].message).toEqual('No accepted file found');
});

it('Returns a 400 if no file is present in request', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('cookie', cookie)
    .set('Content-Type', 'multipart/form-data')
    .expect(400);
});

it('Returns a 201 if file is successfully uploaded', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('cookie', cookie)
    .set('Content-Type', 'multipart/form-data')
    .attach('file', fs.readFileSync(filePath), filePath)
    .expect(201);
});

it('Access is set to course if access type is set to course in file document', async () => {
  const { courseId, ownerId } = await createCourse();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  await request(app)
    .post(path)
    .set('cookie', cookie)
    .set('Content-Type', 'multipart/form-data')
    .field('accessType', 'course')
    .field('accessIds', JSON.stringify([courseId]))
    .attach('file', fs.readFileSync(filePath), filePath)
    .expect(201);

  // @ts-ignore
  const file = await File.findOne({ access: { ids: courseId } });

  // @ts-ignore
  expect(file.access.type).toEqual('course');
  // @ts-ignore
  expect(file.access.ids).toEqual([courseId]);
});

it('Access is set to users if access type is set to users', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  const userIds = [
    new mongoose.Types.ObjectId().toHexString(),
    new mongoose.Types.ObjectId().toHexString(),
  ];

  await request(app)
    .post(path)
    .set('Content-Type', 'multipart/form-data')
    .set('cookie', cookie)
    .field('accessType', 'user')
    .field('accessIds', JSON.stringify(userIds))
    .attach('file', fs.readFileSync(filePath), filePath)
    .expect(201);

  // @ts-ignore
  const file = await File.findOne({ access: { ids: userIds } });

  // @ts-ignore
  expect(file.access.type).toEqual('user');
  // @ts-ignore
  expect(file.access.ids).toEqual(userIds);
});

it('Calls all the necessary functions to upload a file to Backblaze', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  const userIds = [
    new mongoose.Types.ObjectId().toHexString(),
    new mongoose.Types.ObjectId().toHexString(),
  ];

  await request(app)
    .post(path)
    .set('cookie', cookie)
    .set('Content-Type', 'multipart/form-data')
    .field('accessType', 'user')
    .field('accessIds', JSON.stringify(userIds))
    .attach('file', fs.readFileSync(filePath), filePath)
    .expect(201);

  expect(b2.authorize).toHaveBeenCalled();
  expect(b2.getBucket).toHaveBeenCalled();
  expect(b2.getUploadUrl).toHaveBeenCalled();
  expect(b2.uploadFile).toHaveBeenCalled();
});
