import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/phaseitems/fetch';

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

const createPhase = async () => {
  const { courseId, ownerId, name } = await createCourse();
  const [cookie] = await global.getAuthCookie(
    UserTypes.Teacher,
    undefined,
    ownerId,
  );

  const res = await request(app)
    .post('/api/phase/create')
    .set('Cookie', cookie)
    .send({ parentCourse: courseId, name: faker.company.companyName() })
    .expect(201);

  return {
    parentCourse: courseId,
    phase: res.body.phase,
    phaseId: res.body.phase.id,
    cookie,
  };
};

const getPath = (id?: String) => {
  if (id) return `${path}/${id}`;

  return path;
};

describe('Fetch many phases. Phase items are not populated in this case', () => {
  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { parentCourse } = await createPhase();

    await request(app).post(path).send({ parentCourse }).expect(401);
  });

  it('Returns a 401 if user is not course owner, admins or student', async () => {
    const { parentCourse } = await createPhase();
    const [cookie] = await global.getAuthCookie();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({ parentCourse })
      .expect(401);
  });
});

describe('Fetch a single phase', () => {
  it(`Has a route handler listening on ${getPath(
    'examplePhaseId',
  )} for post requests`, async () => {
    const res = await request(app).post(getPath('examplePhaseId')).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { phaseId, parentCourse } = await createPhase();

    await request(app)
      .post(getPath(phaseId))
      .send({
        parentCourse,
      })
      .expect(401);
  });
});
