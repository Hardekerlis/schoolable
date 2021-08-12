/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '@schoolable/common';
import faker from 'faker';
import { app } from '../../../app';

const path = '/api/course/create';

it("Returns a 401 if user isn't signed in", async () => {
  const res = await request(app).post(path).send({});

  console.log(res.body);
});
