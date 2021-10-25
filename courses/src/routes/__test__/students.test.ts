import request from 'supertest';
import faker from 'faker';
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

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {});

it('Returns a 401 if user is not course admin or owner', async () => {});

it('Returns a 400 if student is not found', async () => {});

// Student class is refering to a group of students.
it('Returns a 4oo if student class is not found', async () => {});

it('Returns a 200 if student is successfully updated', async () => {});

// Student class is refering to a group of students.
it('Returns a 200 if student class is found', async () => {});
