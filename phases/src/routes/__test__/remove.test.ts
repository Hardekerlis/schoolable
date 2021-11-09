import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/remove';

import { natsWrapper } from '../../utils/natsWrapper';

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).post(path).send({}).expect(401);
});

it.todo('Returns a 401 if user is not teacher or admin');

it.todo('Returns a 401 if user is not course owner');

it.todo('Returns a 400 if parent course id is not in request body');

it.todo('Returns a 400 if parent module id is not in request body');

it.todo('Returns a 404 if parent course id is not a valid ObjectId');

it.todo('Returns a 404 if parent module id is not a valid ObjectId');

it.todo('Returns a 404 if no parent course is found');

it.todo('Returns a 404 if no parent module is found');

it.todo('Returns a 200 if a phase is successfully queued for deletion');

it.todo('Returns the phase queued for deletion in response body');

it.todo('Publishes NATS event');
