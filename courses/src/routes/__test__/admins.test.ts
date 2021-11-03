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

const addAdmin = async (amount?: number) => {
  const { course, cookie } = await createCourse();

  if (!amount) amount = 2;

  const user = await global.createUser(
    UserTypes.Teacher,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  await request(app)
    .post('/api/course/add/admin')
    .set('Cookie', cookie)
    .send({
      courseId: course.id,
      adminId: user.id,
    })
    .expect(200);

  return { course, cookie, admin: user };
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
        adminId: user.id,
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
      adminId: user.id,
    });

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: user.id,
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

  it('Returns a 200 if admin is successfully added', async () => {
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
        adminId: user.id,
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

  it('Returns a 401 if user is not authenticated', async () => {
    const { admin, course } = await addAdmin();

    await request(app)
      .post(path)
      .send({
        courseId: course.id,
        adminId: admin.id,
      })
      .expect(401);
  });

  it('Returns a 401 if user is not owner or admin of course', async () => {
    const { admin, course } = await addAdmin();
    const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: admin.id,
      })
      .expect(401);
  });

  it('Returns a 400 if adminId is not in request body', async () => {
    const { course, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
      })
      .expect(400);
  });

  it('Returns a 400 if adminId is not a valid ObjectId', async () => {
    const { course, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: 'Not valid object id',
      })
      .expect(400);
  });

  it('Returns a 400 if courseId is not in request body', async () => {
    const { admin, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        adminId: admin.id,
      })
      .expect(400);
  });

  it('Returns a 400 if courseId is not a valid ObjectId', async () => {
    const { admin, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: 'Not valid object id',
        adminId: admin.id,
      })
      .expect(400);
  });

  it('Returns a 404 if no course is found', async () => {
    const { admin, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: new mongoose.Types.ObjectId().toHexString(),
        adminId: admin.id,
      })
      .expect(404);
  });

  it('Returns a 404 if no admin is found', async () => {
    const { course, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it('Returns a 200 if user is application admin and not course owner or admin', async () => {
    const { course, admin } = await addAdmin();
    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: admin.id,
      })
      .expect(200);
  });

  it('Returns a 200 if user is successfully added to admins array', async () => {
    const { course, admin, cookie } = await addAdmin();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        adminId: admin.id,
      })
      .expect(200);
  });
});
