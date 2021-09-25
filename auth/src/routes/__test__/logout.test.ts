import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/auth/login';

interface ValidUser {
  email: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
}

const getUserData = (userType: UserTypes): ValidUser => {
  return {
    email: faker.internet.email(),
    userType: userType,
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };
};

interface RegisteredUser {
  email: string;
  password: string;
  id: string;
}

const registerUser = async (userType: UserTypes): Promise<RegisteredUser> => {
  if (!global.adminCookie) {
    await global.getAuthCookie();
  }
  const path = '/api/auth/register';

  const { body } = await request(app)
    .post(path)
    // @ts-ignore
    .set('Cookie', global.adminCookie)
    .send(getUserData(userType))
    .expect(201);

  const { user, tempPassword } = body;

  const { email, id } = user;

  return { email, password: tempPassword, id };
};

it('Returns a 400 if no cookie is present', async () => {
  await request(app).get('/api/auth/logout').send().expect(400);
});

it('Returns a 200 if cookies is removed', async () => {
  const { email, password } = await registerUser(UserTypes.Teacher);

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  const cookie = res.get('Set-Cookie');

  await request(app)
    .get('/api/auth/logout')
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

it('No cookie is present on response', async () => {
  const { email, password } = await registerUser(UserTypes.Teacher);

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  const cookie = res.get('Set-Cookie');

  const logoutRes = await request(app)
    .get('/api/auth/logout')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(logoutRes.get('Set-Cookie')).toEqual([
    'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ]);
});
