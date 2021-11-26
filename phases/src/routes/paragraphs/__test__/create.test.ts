import request from 'supertest';
import faker from 'faker';
import { app } from '../../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/paragraphs/create';

import { natsWrapper } from '../../../utils/natsWrapper';
import logger from '../../../utils/logger';

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).post(path).send({}).expect(401);
});

it('Returns a 401 if user is not teacher or admin', async () => {
  const { cookie } = await global.getAuthCookie(UserTypes.Student);

  await request(app).post(path).set('Cookie', cookie).send().expect(401);
});

it('Returns a 401 if user is not course owner', async () => {
  const { phase } = await global.createPhase();
  const { cookie } = await global.getAuthCookie();

  await request(app)
    .post(path)
    .set('Cookie', cookie)
    .send({
      phasePageId: phase.page.id,
      name: faker.company.companyName(),
    })
    .expect(401);
});
