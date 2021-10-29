import request from 'supertest';
import faker from 'faker';
import mongoose from 'mongoose';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/course/add/student';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  await request(app).post(path).send({}).expect(401);
});

it('Returns a 401 if user is not course admin or owner', async () => {
  const { course } = await createCourse();
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      courseId: course.id,
      studentId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(401);
});

it('Returns a 400 if student is not found', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      courseId: course.id,
      studentId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(400);
});

// Student class is refering to a group of students.
it.todo('Returns a 4oo if student class is not found');

it('Returns a 200 if student is successfully added', async () => {
  const { course, cookie } = await createCourse();
  const user = await global.createUser(
    UserTypes.Student,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      courseId: course.id,
      studentId: user.userId,
    })
    .expect(200);
});

// Student class is refering to a group of students.
it.todo('Returns a 200 if students in class are added');
