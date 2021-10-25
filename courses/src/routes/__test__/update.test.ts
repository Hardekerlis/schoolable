import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/course/update';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

const updateCourse = async ({}) => {};

it(`Has a route handler listening on ${path} for put requests`, async () => {
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

it('Returns a 200 if course was successfully updated', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({ name: 'new name', courseId: course.id })
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
  const description = 'new description';

  const res = await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      coursePage: {
        description: description,
      },
      courseId: course.id,
    })
    .expect(200);

  expect(res.body.course.coursePage.description).not.toEqual(
    course.coursePage.description,
  );
});
