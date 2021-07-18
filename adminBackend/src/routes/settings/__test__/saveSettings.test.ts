/** @format */

import request from 'supertest';

import { app } from '../../../app';

const path = '/api/settings';

it('Returns a 401 if auth cookie is missing', async () => {
  await request(app)
    .put(path)
    .send({
      isSetup: 'New value',
    })
    .expect(401);
});

it('Returns status code 204 on successful update', async () => {
  const [cookie] = await global.getAuthCookie();
  const currentSetting = await request(app)
    .get(path)
    .set('Cookie', cookie)
    .expect(200);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      isSetup: !currentSetting.body.isSetup,
    })
    .expect(204);

  await request(app)
    .put(path)
    .set('Cookie', cookie)
    .send({
      isSetup: currentSetting.body.isSetup,
    })
    .expect(204);
});
