import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/users/';

it(`Has a route handler listening on ${path} for GET requests`, async () => {
  const res = await request(app).get(path).send({});

  expect(res.status).not.toEqual(404);
});
