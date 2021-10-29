import request from 'supertest';
import jwt from 'jsonwebtoken';
import { UserPayload } from '@gustafdahl/schoolable-common';
import mongoose from 'mongoose';
import { app } from '../../app';

const path = '/api/sessions/check';

it(`Has a route handler listening on ${path} for get requests`, async () => {
  const res = await request(app).get(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if no token cookie is present in request body', async () => {
  await request(app).get(path).send().expect(401);
});

it('Returns a 401 if no session is found', async () => {
  const [cookie] = await global.getFaultyAuthCookie();

  await request(app).get(path).set('Cookie', cookie).send().expect(401);
});

it('Returns a 400 if cookie is not signed', async () => {
  const [cookie] = await global.getUnsignedAuthCookie();

  await request(app).get(path).set('Cookie', cookie).send().expect(400);
});

it("Clears cookie if it's not signed", async () => {
  const [cookie] = await global.getUnsignedAuthCookie();

  const res = await request(app)
    .get(path)
    .set('Cookie', cookie)
    .send()
    .expect(400);

  expect(res.get('Set-Cookie')).toContain(
    'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
});

it('Returns a 200 if token is valid', async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app).get(path).set('Cookie', cookie).send().expect(200);
});
