/** @format */

import request from 'supertest';
import { CONFIG } from '@schoolable/common';
import faker from 'faker';

import { app } from '../../../app';
import { UserTypes } from '../../../utils/userTypes.enum';

const path = '/api/users';

async function getName() {
  return faker.name.firstName() + ' ' + faker.name.lastName();
}

async function generate2UserTypes(cookie: any) {
  for (let i = 0; i < 11; i++) {
    await request(app)
      .post('/api/users/register')
      .set('Cookie', cookie)
      .send({
        email: faker.internet.email(),
        userType: UserTypes.Teacher,
        name: await getName(),
      })
      .expect(201);
  }

  for (let i = 0; i < 11; i++) {
    await request(app)
      .post('/api/users/register')
      .set('Cookie', cookie)
      .send({
        email: faker.internet.email(),
        userType: UserTypes.Student,
        name: await getName(),
      })
      .expect(201);
  }
}

it('Returns a 401 if no auth cookie is present', async () => {
  return await request(app).post(path).expect(401);
});

it('Returns a 404 if no users match the search query', async () => {
  const cookie = await global.getAuthCookie();

  await generate2UserTypes(cookie);

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      query: '22asdasdsa',
    })
    .expect(404);
});

it('Returns a 200 if successfully fetched users', async () => {
  const cookie = await global.getAuthCookie();

  await request(app)
    .post('/api/users/register')
    .set('Cookie', cookie)
    .send({
      email: faker.internet.email(),
      userType: UserTypes.Teacher,
      name: await getName(),
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
        name: await getName(),
      })
      .expect(201);
  }

  const res = await request(app).post(path).set('Cookie', cookie).send({});

  expect(res.body.users.length).toEqual(50);
});

it('Returns array sorted after userType if sortAfter is set to userType', async () => {
  const cookie = await global.getAuthCookie();

  await generate2UserTypes(cookie);

  const res = await request(app).post(path).set('Cookie', cookie).send({
    sortAfter: '-userType',
  });

  const { users } = res.body;
  let index = 0;
  for (const user of users) {
    if (index < 11) {
      expect(user.userType).toEqual(UserTypes.Teacher);
    } else {
      expect(user.userType).toEqual(UserTypes.Student);
    }

    index++;
  }

  expect(users[0].userType).toEqual(UserTypes.Teacher);
  expect(users[11].userType).toEqual(UserTypes.Student);
  expect(users.length).toEqual(22);
});

it("Only returns users of type teacher if the search query is 'teacher'", async () => {
  const cookie = await global.getAuthCookie();

  await generate2UserTypes(cookie);

  const res = await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      query: 'teacher',
    })
    .expect(200);

  const { users } = res.body;
  for (const user of users) {
    expect(user.userType).toEqual(UserTypes.Teacher);
  }

  expect(users[0].userType).toEqual(UserTypes.Teacher);
  expect(users.length).toEqual(11);
});
