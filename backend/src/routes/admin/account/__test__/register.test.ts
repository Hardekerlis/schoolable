/** @format */

import request from 'supertest';
import { app } from '../../../../app';

const path = '/api/admin/register';

it('Returns a 400 with missing registration data', async () => {
  return await request(app).post(path).send({}).expect(400);
});

it('Returns a 400 on client sending an invalid email', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'asdasfgasgas',
      password: 'password',
      name: 'Gustaf Dahl',
      confirmPassword: 'password',
    })
    .expect(400);
});

it('Returns a 400 if email supplied by client already is in use', async () => {
  const data = {
    email: 'test@test.com',
    name: 'John Doe',
    password: '12345',
    confirmPassword: '12345',
  };

  await request(app).post(path).send(data).expect(201);

  await request(app).post(path).send(data).expect(400);
});

it('Returns a 400 on client sending a non valid password', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'test',
      name: 'John Doe',
      confirmPassword: 'test',
    })
    .expect(400);
});

it('Returns a 400 on client sending non matching passwords', async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'Gustaf Dahl',
      confirmPassword: 'notTheSamePassword',
    })
    .expect(400);
});

it("Returns a 400 if a client doesn't supply a name", async () => {
  return await request(app)
    .post(path)
    .send({
      email: 'test@test.com',
      password: '12345',
      confirmPassword: '12345',
    })
    .expect(400);
});

const validRequestData = {
  email: 'test@test.com',
  password: 'password',
  name: 'John Doe',
  confirmPassword: 'password',
};

it('Returns a 201 on succesfully registering an admin user', async () => {
  return await request(app).post(path).send(validRequestData).expect(201);
});

it('Sets a cookie on successfully registering first admin user and not on second', async () => {
  const firstUser = await request(app)
    .post(path)
    .send(validRequestData)
    .expect(201);
  expect(firstUser.get('Set-Cookie')).toBeDefined();

  const secondUser = await request(app)
    .post(path)
    .send({
      email: 'test2@test.com',
      password: 'password',
      name: 'John Doe',
      confirmPassword: 'password',
    })
    .expect(201);

  expect(secondUser.get('Set-Cookie')).toBeUndefined();
});

it('Object value "verified" is set to false if another admin already exists', async () => {
  await request(app).post(path).send(validRequestData).expect(201);

  validRequestData.email = 'test2@test.com';
  const secondAdmin = await request(app)
    .post(path)
    .send(validRequestData)
    .expect(201);

  // @ts-ignore
  expect(secondAdmin.body.verified === false);
});

it('Responds with json', async () => {
  return await request(app)
    .post(path)
    .send(validRequestData)
    .expect('Content-Type', /json/);
});
