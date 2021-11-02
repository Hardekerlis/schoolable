import request from 'supertest';
import faker from 'faker';
import mongoose from 'mongoose';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

describe('Add admin', () => {
  const path = '/api/course/add/admin';

  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    await request(app).post(path).send({}).expect(401);
  });

  it('Returns a 401 if user is not course owner', async () => {
    const { course } = await createCourse();
    const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(401);
  });

  it('Returns a 400 if course id is invalid', async () => {
    const { cookie } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: 'invalid course id',
        adminId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(400);
  });

  it('Returns a 400 if admin id is invalid', async () => {
    const { cookie, course } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: 'invalid admin id',
      })
      .expect(400);
  });

  it('Returns a 400 if course admin already has been added', async () => {
    const { course, cookie } = await createCourse();
    const user = await global.createUser(
      UserTypes.Teacher,
      faker.internet.email(),
      new mongoose.Types.ObjectId().toHexString(),
    );

    await request(app).post(path).set('Cookie', cookie).send({
      courseId: course.id,
      adminId: user.userId,
    });

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: user.userId,
      })
      .expect(400);
  });

  it('Returns a 404 if no course is found', async () => {
    const { cookie } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: new mongoose.Types.ObjectId().toHexString(),
        adminId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it('Returns a 404 if no admin is found', async () => {
    const { cookie, course } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it('Returns a 200 if student is successfully added', async () => {
    const { course, cookie } = await createCourse();
    const user = await global.createUser(
      UserTypes.Teacher,
      faker.internet.email(),
      new mongoose.Types.ObjectId().toHexString(),
    );

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: user.userId,
      })
      .expect(200);
  });
});

describe('Remove admin ', () => {
  const path = '/api/course/remove/admin';

  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });
});
