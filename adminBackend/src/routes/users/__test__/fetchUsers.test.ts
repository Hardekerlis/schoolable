/** @format */

import request from 'supertest';
import { CONFIG } from '@schoolable/common';

import { app } from '../../../app';
import { UserTypes } from '../../../utils/userTypes.enum';

const path = '/api/users';

it('Returns a 401 if no auth cookie is present', async () => {
  return await request(app).post(path).expect(401);
});

it('Returns a 200 if successfully fetched users', async () => {
  const cookie = await global.getAuthCookie();

  await request(app).post('/api/users/register').set('Cookie', cookie).send({
    email: 'test@test.com',
    userType: UserTypes.Teacher,
    name: 'John Doe',
  });

  return await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({})
    .expect(200);
});

it('Returns a maximum of 50 users', async () => {
  const cookie = await global.getAuthCookie();

  for (let i = 0; i <= 51; i++) {
    await request(app)
      .post('/api/users/register')
      .set('Cookie', cookie)
      .send({
        email: `teacher${i}@test.com`,
        userType: UserTypes.Teacher,
        name: 'John Doe',
      })
      .expect(201);
  }

  const res = await request(app).post(path).set('Cookie', cookie).send({});

  expect(res.body.users.length).toEqual(50);
});

it('Returns only students if sortAfter is set to students', async () => {
  const cookie = await global.getAuthCookie();

  for (let i = 0; i <= 11; i++) {
    await request(app)
      .post('/api/users/register')
      .set('Cookie', cookie)
      .send({
        email: `teacher${i}@test.com`,
        userType: UserTypes.Teacher,
        name: 'John Doe',
      })
      .expect(201);
  }

  for (let i = 0; i <= 11; i++) {
    await request(app)
      .post('/api/users/register')
      .set('Cookie', cookie)
      .send({
        email: `student${i}@test.com`,
        userType: UserTypes.Student,
        name: 'John Doe',
      })
      .expect(201);
  }

  const res = await request(app).post(path).set('Cookie', cookie).send({
    sortAfter: UserTypes.Student,
  });

  const { users } = res.body;
  for (const user of users) {
    expect(user.userType).toEqual('student');
  }

  expect(users[0].userType).toEqual('student');
});

/*
{
query: string,
sortParam: string - tex: userType, email, name, class,
}
*/
