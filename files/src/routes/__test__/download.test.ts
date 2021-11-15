import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import fs from 'fs';
import { URL } from 'url';

import { UserTypes } from '@gustafdahl/schoolable-common';

import Course from '../../models/course';
import File from '../../models/file';

import b2 from '../../utils/b2';
import logger from '../../utils/logger';

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

const getPath = (id: string) => {
  return '/api/files/' + id;
};

const objectId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

const filePath = `${__dirname}/testFiles/testpdf.pdf`;
const unallowedFileMimeType = `${__dirname}/testFiles/badFileType.js`;

it(`Has a route handler listening on ${getPath(
  objectId(),
)} for get requests`, async () => {
  const res = await request(app).get(getPath(objectId())).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  await request(app).get(getPath(objectId())).send().expect(401);
});
