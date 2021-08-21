/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '../../../library';
import faker from 'faker';
import { app } from '../../../app';

const path = '/api/logout';

it('Returns a 401 if user is not logged in', async () => {
  return await request(app).get(path).send({}).expect(401);
});

// it("Returns a 400 if user is logged ")

it('Returns a 200 if user was logged out', async () => {
  const [cookie] = await global.getAuthCookie();

  return await request(app)
    .get(path)
    .set('Cookie', cookie)
    .send({})
    .expect(200);
});
