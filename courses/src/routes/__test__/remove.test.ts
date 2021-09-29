import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/course/remove';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not logged in', async () => {
  await request(app).delete(path).send().expect(401);
});

it('Returns a 401 if user is not of type teacher or admin', async () => {
  const { course } = await createCourse();
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ courseId: course.id })
    .expect(401);
});

it('Returns a 401 if user is of type teacher but doesnt own course', async () => {
  const { course } = await createCourse();
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ courseId: course.id })
    .expect(401);
});

it('Returns a 400 if courseId is not present in body', async () => {
  const { course, cookie } = await createCourse();

  await request(app).delete(path).set('Cookie', cookie).send({}).expect(400);
});

it('Returns a 200 on successful deletion', async () => {
  const { course, cookie } = await createCourse();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ courseId: course.id })
    .expect(200);
});

it('upForDeletion is true', async () => {
  const { course, cookie } = await createCourse();

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ courseId: course.id })
    .expect(200);

  expect(res.body.course.upForDeletion).toEqual(true);
});
