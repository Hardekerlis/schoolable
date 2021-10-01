import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/phase/update';

import Course from '../../models/course';
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

it(`Has a route handler listening on ${path} for put requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});
