/** @format */

import request from 'supertest';

import { app } from '../../../app';

const path = '/api/settings/publish';

it('Returns a 401 if auth cookie is missing', async () => {
  await request(app).get(path).expect(401);
});

it('Returns a 204 if the publish was successful', async () => {
  const [cookie] = await global.getAuthCookie();
  await request(app).get(path).set('Cookie', cookie).expect(204);
});
