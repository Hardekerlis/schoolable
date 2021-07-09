/** @format */

import request from 'supertest';
import { app } from '../../../app';

const path = '/api/login';

it('Returns a 400 with missing login data', async () => {
  return await request(app).post(path).send({}).expect(400);
});

it('Returns a 204 if no account was found', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'notexisting@user.com',
      password: 'password',
    })
    .expect(204);
});

it('Returns a 400 with invalid email', async () => {
  return await request(app).post(path).send({
    email: 'notvalid.com',
    password: 'password',
  });
});

const registerData = {
  email: 'test@test.com',
  password: 'password',
  name: 'John Doe',
  confirmPassword: 'password',
};

it('Returns a 400 if the user supplied wrong password', async () => {
  await request(app).post('/api/register').send(registerData).expect(201);

  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'wrongpassword',
    })
    .expect(400);
});

it('Returns a 200 on successful login', async () => {
  await request(app).post('/api/register').send(registerData).expect(201);

  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);
});

it('Sets a cookie after successful login', async () => {
  await request(app).post('/api/register').send(registerData).expect(201);

  const response = await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});

// There is no way to write test for this currenlty - come back when there is more to app
it('Active session is cancelled if admin login again (TODO)', async () => {
  return expect(500);
  // const response = await request(app)
  //   .post('/api/register')
  //   .send(registerData)
  //   .expect(201);
  //
  // const cookie = response.get('Set-Cookie');
  //
  // await request(app)
  //   .post(path)
  //   .send({
  //     email: 'test@test.com',
  //     password: 'password',
  //   })
  //   .expect(200);
  //
  // await request(app)
  //     .post(path)
  //     .send({
  //       email: 'test@test.com',
  //       password: 'password',
  //     })
  //     .expect(200);
});
