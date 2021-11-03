import request from 'supertest';
import faker from 'faker';
import mongoose from 'mongoose';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

const addStudent = async (amount?: number) => {
  const { course, cookie } = await createCourse();

  if (!amount) amount = 2;

  const user = await global.createUser(
    UserTypes.Student,
    faker.internet.email(),
    new mongoose.Types.ObjectId().toHexString(),
  );

  await request(app)
    .post('/api/course/add/student')
    .set('Cookie', cookie)
    .send({
      courseId: course.id,
      studentId: user.id,
    })
    .expect(200);

  return { course, cookie, student: user };
};

describe('Add students', () => {
  const path = '/api/course/add/student';

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

  it('Returns a 400 if course id is invalid', async () => {
    const { cookie } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: 'invalid course id',
        studentId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(400);
  });

  it('Returns a 400 if student id is invalid', async () => {
    const { cookie, course } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: 'invalid student id',
      })
      .expect(400);
  });

  it('Returns a 400 if student already has been added', async () => {
    const { course, cookie } = await createCourse();
    const user = await global.createUser(
      UserTypes.Student,
      faker.internet.email(),
      new mongoose.Types.ObjectId().toHexString(),
    );

    await request(app).post(path).set('Cookie', cookie).send({
      courseId: course.id,
      studentId: user.id,
    });

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: user.id,
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
        studentId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it('Returns a 404 if student is not found', async () => {
    const { course, cookie } = await createCourse();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  // Student class is refering to a group of students.
  it.todo('Returns a 400 if student class is not found');

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
        studentId: user.id,
      })
      .expect(200);
  });

  // Student class is refering to a group of students.
  it.todo('Returns a 200 if students in class are added');
});

describe('Remove students', () => {
  const path = '/api/course/remove/student';

  it(`Has a route handler listening on ${path} for post requests`, async () => {
    const res = await request(app).post(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { student, course } = await addStudent();

    await request(app)
      .post(path)
      .send({
        courseId: course.id,
        studentId: student.id,
      })
      .expect(401);
  });

  it('Returns a 401 if user is not owner or admin of course', async () => {
    const { student, course } = await addStudent();
    const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: student.id,
      })
      .expect(401);
  });

  it('Returns a 400 if studentId is not in request body', async () => {
    const { course, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
      })
      .expect(400);
  });

  it('Returns a 400 if studentId is not a valid ObjectId', async () => {
    const { course, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: 'Not valid object id',
      })
      .expect(400);
  });

  it('Returns a 400 if courseId is not in request body', async () => {
    const { student, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        studentId: student.id,
      })
      .expect(400);
  });

  it('Returns a 400 if courseId is not a valid ObjectId', async () => {
    const { student, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: 'Not valid object id',
        studentId: student.id,
      })
      .expect(400);
  });

  it('Returns a 404 if no course is found', async () => {
    const { student, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: new mongoose.Types.ObjectId().toHexString(),
        studentId: student.id,
      })
      .expect(404);
  });

  it('Returns a 404 if no student is found', async () => {
    const { course, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it('Returns a 200 if user is application admin and not course owner or admin', async () => {
    const { course, student } = await addStudent();
    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: student.id,
      })
      .expect(200);
  });

  it('Returns a 200 if user is successfully added to students array', async () => {
    const { course, student, cookie } = await addStudent();

    await request(app)
      .post(path)
      .set('Cookie', cookie)
      .send({
        courseId: course.id,
        studentId: student.id,
      })
      .expect(200);
  });
});
