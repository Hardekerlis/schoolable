/** @format */

import request from 'supertest';
import { CONFIG, UserTypes } from '@schoolable/common';
import faker from 'faker';
import { app } from '../../../app';

const path = '/api/changePassword';

it('Returns a 401 if user is not authenticated (TODO)', async () => {
  expect(true).toEqual(false);
  expect(401);
});
