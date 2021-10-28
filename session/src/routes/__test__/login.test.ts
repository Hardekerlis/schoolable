import request from 'supertest';
import faker from 'faker';
import { nanoid } from 'nanoid';
import { app } from '../../app';

const path = '/api/session/';

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 400 if no user is found', async () => {
  const { password } = await global.createUser();

  await request(app)
    .post(path)
    .send({
      email: faker.internet.email(),
      password,
    })
    .expect(400);
});

it('Error message is "Wrong credentials" if email is wrong', async () => {
  const { password } = await global.createUser();

  const res = await request(app)
    .post(path)
    .send({
      email: faker.internet.email(),
      password,
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('Wrong credentials');
});

it('Returns a 400 if no email is found in body', async () => {
  const { password } = await global.createUser();

  await request(app)
    .post(path)
    .send({
      password,
    })
    .expect(400);
});

it('Returns a 400 if password is wrong', async () => {
  const { user } = await global.createUser();

  await request(app)
    .post(path)
    .send({
      email: user.email,
      password: nanoid(),
    })
    .expect(400);
});

it('Error message is "Wrong credentials" if password is wrong', async () => {
  const { user } = await global.createUser();

  const res = await request(app)
    .post(path)
    .send({
      email: user.email,
      password: nanoid(),
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('Wrong credentials');
});

it('Returns a 400 if no password is found in body', async () => {
  const res = await request(app)
    .post(path)
    .send({
      email: faker.internet.email(),
    })
    .expect(400);
});

it('Returns a 200 if login is successful', async () => {
  const { user, password } = await global.createUser();

  await request(app)
    .post(path)
    .send({
      email: user.email,
      password,
    })
    .expect(200);
});

it('Response object contains token cookie', async () => {
  const { user, password } = await global.createUser();

  const res = await request(app)
    .post(path)
    .send({
      email: user.email,
      password,
    })
    .expect(200);

  expect(res.get('Set-Cookie')[0]).toContain('token=');
});
