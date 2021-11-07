import request from 'supertest';
import faker from 'faker';
import mongoose from 'mongoose';
import { app } from '../../app';

import { natsWrapper } from '../../utils/natsWrapper';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/courses/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

const path = '/api/courses/update';

it(`Has a route handler listening on ${path} for PUT requests`, async () => {
  const res = await request(app).put(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  const { course } = await createCourse();

  await request(app)
    .put(path)
    .send({
      name: 'new name',
      courseId: course.id,
    })
    .expect(401);
});

it('Returns a 401 if user is not course owner', async () => {
  const { course } = await createCourse();
  const [cookie] = await global.getAuthCookie();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ name: 'new name', courseId: course.id })
    .expect(401);
});

it('Returns a 400 if admins is present in request body', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      name: 'new name',
      admins: [new mongoose.Types.ObjectId().toHexString()],
      courseId: course.id,
    })
    .expect(400);
});

it('Returns a 400 if students are present in request body', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      name: 'new name',
      students: [new mongoose.Types.ObjectId().toHexString()],
      courseId: course.id,
    })
    .expect(400);
});

it('Returns a 400 if course id is invalid', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      name: 'new name',
      courseId: 'Invalid course id',
    })
    .expect(400);
});

it('Returns a 400 if course id is not present in request body', async () => {
  const { cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      name: 'new name',
    })
    .expect(400);
});

it('Returns a 404 if no course is found', async () => {
  const { cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      name: 'new name',
      locked: true,
      courseId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 200 if course was successfully updated', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ name: 'new name', locked: true, courseId: course.id })
    .expect(200);
});

it('Returns updated course if update is successful', async () => {
  const { course, cookie } = await createCourse();

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ name: 'new name', courseId: course.id })
    .expect(200);

  expect(res.body.course.name).not.toEqual(course.name);
});

it('course page is updated if it is changed', async () => {
  const { course, cookie } = await createCourse();

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      coursePage: {
        description: 'new description',
      },
      courseId: course.id,
    })
    .expect(200);

  expect(res.body.course.coursePage.description).not.toEqual(
    course.coursePage.description,
  );
});

it('Publishes NATS wrapper', async () => {
  const { course, cookie } = await createCourse();

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      coursePage: {
        description: 'new description',
      },
      courseId: course.id,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
