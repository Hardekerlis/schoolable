/** @format */

import request from 'supertest';
import { CONFIG } from '@schoolable/common';

import { app } from '../../../app';

const path = '/api/settings';

it('Returns a 401 if user is not authorized', async () => {
  return await request(app).get(path).expect(401);
});

it('Returns a JSON object which equals CONFIG variable', async () => {
  const res = await request(app)
    .post('/api/register')
    .send({
      email: 'test@test.com',
      name: 'John Doe',
      password: '12345',
      confirmPassword: '12345',
    })
    .expect(201);

  const [cookie] = res.get('Set-Cookie');

  const settings = await request(app)
    .get(path)
    .set('Cookie', cookie)
    .expect(200)
    .expect('Content-Type', /json/);

  return expect(settings.body).toEqual(CONFIG);
});
