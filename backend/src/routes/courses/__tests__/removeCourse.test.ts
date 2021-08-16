/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '@schoolable/common';
import faker from 'faker';
import { app } from '../../../app';

const path = '/api/course';

it("Returns a 401 if user isn't signed in", async () => {
  await request(app).delete(path).send({}).expect(401);
});

it('Returns 401 if user is trying to delete a course which it doesnt own', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', await global.getAuthCookie())
    .send({
      name: 'Math',
    })
    .expect(201);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      id: res.body.course.id,
    })
    .expect(401);
});
