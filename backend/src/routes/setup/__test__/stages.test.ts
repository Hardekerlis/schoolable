/** @format */

import request from 'supertest';
import { app } from '../../../app';

const path = '/api/setup/stage/';

async function runStages(
  cookie: string | undefined,
  password: string,
  confirmPassword: string,
) {
  if (!cookie) cookie = 'asdasdas';
  const stage1 = await request(app)
    .post(path + '1')
    .set('Cookie', cookie)
    .send({
      password,
      confirmPassword,
    });

  const stage2 = await request(app)
    .post(path + '2')
    .set('Cookie', cookie)
    .send({
      theme: 'light',
    });

  const stage3 = await request(app)
    .post(path + '3')
    .set('Cookie', cookie)
    .send({
      language: 'SWE',
    });

  return [stage1, stage2, stage3];
}

it('Returns a 401 if user is not authenticated', async () => {
  const res = await runStages(undefined, '213456', '123456');
  expect(res[0].statusCode).toEqual(401);
  expect(res[1].statusCode).toEqual(401);
  expect(res[2].statusCode).toEqual(401);
});

it("Returns a 400 if password and confirmPassword don't match", async () => {
  const [cookie] = await global.getAuthCookie();
  const res = await runStages(cookie, 'password', 'notsamepassword');

  expect(res[0].statusCode).toEqual(400);
});

it('Returns a 200 from all stages if they where successful', async () => {
  const [cookie] = await global.getAuthCookie();
  const res = await runStages(cookie, 'password', 'password');
  for (const i in res) {
    expect(res[i].statusCode).toEqual(200);
  }
});
