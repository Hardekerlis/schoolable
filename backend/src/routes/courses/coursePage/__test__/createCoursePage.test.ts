/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '../../../../library';
import faker from 'faker';
import { app } from '../../../../app';

const path = '/api/coursePage/create';

it("Returns a 401 if user isn't signed in", async () => {
  await request(app).post(path).send({}).expect(401);
});

it("Returns a 401 if user isn't a teacher or admin", async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Student);

  await request(app).post(path).set('Cookie', cookie).send({}).expect(401);
});
