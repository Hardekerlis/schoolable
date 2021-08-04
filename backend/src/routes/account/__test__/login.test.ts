/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '@schoolable/common';
import faker from 'faker';
import { app } from '../../../app';

const adminBackendUrl = `http://localhost:${CONFIG.port}`;
const path = '/api/login';

it('Returns a 400 with missing login data', async () => {
  return await request(app).post(path).send({}).expect(400);
});

it('Returns a 400 with invalid email', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'notvalid.com',
      password: 'password',
    })
    .expect(400);
});

it('Returns a 400 with invalid userType', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'password',
      userType: 'Notvalid',
    })
    .expect(400);
});

it('Returns a 400 if password is to short', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'notexisting@user.com',
      password: '1234',
      userType: UserTypes.Teacher,
    })
    .expect(400);
});

it('Returns a 400 if no account was found', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'notexisting@user.com',
      password: 'password',
      userType: UserTypes.Teacher,
    })
    .expect(400);
});

const registerAdminData = {
  email: 'test@test.com',
  password: 'password',
  name: 'John Doe',
  confirmPassword: 'password',
};

it('Returns a 400 if the user supplied wrong password', async () => {
  const adminCookie = await (global as any).getAdminAuthCookie();

  const res = await request(adminBackendUrl)
    .post(`/api/users/register`)
    .set('Cookie', adminCookie)
    .send({
      email: faker.internet.email(),
      userType: UserTypes.Teacher,
      name: `${faker.name.findName()} ${faker.name.lastName()}`,
    });

  const { user } = res.body;

  return await request(app)
    .post(path)
    .send({
      email: user.email,
      password: '123456',
      userType: user.userType,
    })
    .expect(400);
});

it('Returns a 200 if the login attempt is successful', async () => {
  const adminCookie = await (global as any).getAdminAuthCookie();

  const res = await request(adminBackendUrl)
    .post(`/api/users/register`)
    .set('Cookie', adminCookie)
    .send({
      email: faker.internet.email(),
      userType: UserTypes.Teacher,
      name: `${faker.name.findName()} ${faker.name.lastName()}`,
    })
    .expect(201);

  const { user } = res.body;

  return await request(app)
    .post(path)
    .send({
      email: user.email,
      password: res.body.tempPassword,
      userType: user.userType,
    })
    .expect(200);
});

it('Returns a cookie if login is successful', async () => {
  const adminCookie = await (global as any).getAdminAuthCookie();

  const res = await request(adminBackendUrl)
    .post(`/api/users/register`)
    .set('Cookie', adminCookie)
    .send({
      email: faker.internet.email(),
      userType: UserTypes.Teacher,
      name: `${faker.name.findName()} ${faker.name.lastName()}`,
    })
    .expect(201);

  const { user } = res.body;
  const loginRes = await request(app).post(path).send({
    email: user.email,
    password: res.body.tempPassword,
    userType: user.userType,
  });

  expect(loginRes.get('Set-Cookie')).toBeDefined();
});

// it('Returns a 200 on successful login', async () => {
//   await request(app).post('/api/register').send(registerData).expect(201);
//
//   return await request(app)
//     .post(path)
//     .send({
//       email: 'test@test.com',
//       password: 'password',
//     })
//     .expect(200);
// });
//
// it('Sets a cookie after successful login', async () => {
//   await request(app).post('/api/register').send(registerData).expect(201);
//
//   const response = await request(app)
//     .post(path)
//     .send({
//       email: 'test@test.com',
//       password: 'password',
//     })
//     .expect(200);
//
//   expect(response.get('Set-Cookie')).toBeDefined();
// });
//
// // There is no way to write test for this currenlty - come back when there is more to app
// it('Active session is cancelled if admin login again (TODO)', async () => {
//   return expect(500);
//   // const response = await request(app)
//   //   .post('/api/register')
//   //   .send(registerData)
//   //   .expect(201);
//   //
//   // const cookie = response.get('Set-Cookie');
//   //
//   // await request(app)
//   //   .post(path)
//   //   .send({
//   //     email: 'test@test.com',
//   //     password: 'password',
//   //   })
//   //   .expect(200);
//   //
//   // await request(app)
//   //     .post(path)
//   //     .send({
//   //       email: 'test@test.com',
//   //       password: 'password',
//   //     })
//   //     .expect(200);
// });
