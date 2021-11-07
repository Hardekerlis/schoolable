import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases';

import { natsWrapper } from '../../utils/natsWrapper';

it(`Has a route handler listening on ${path} for post requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).post(path).send({}).expect(401);
});

it.todo('Returns a 401 if user is not teacher or admin');

it.todo('Returns a 401 if user is not course owner or course admin');

it.todo('Returns a 400 if parent course id is not in request body');

it.todo('Returns a 400 if parent module id is not in request body');

it.todo('Returns a 400 if name is not in request body');

it.todo('Returns a 404 if parent course id is not a valid ObjectId');

it.todo('Returns a 404 if parent module id is not a valid ObjectId');

it.todo('Returns a 404 if no parent course is found');

it.todo('Returns a 404 if no parent module is found');

it.todo('Returns a 201 if a phase is created');

it.todo('Returns the created phase in response body');

it.todo('Publishes NATS event');
