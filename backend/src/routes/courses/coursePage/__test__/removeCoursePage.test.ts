/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../app';

const path = '/api/coursePage';

it('Returns a 401 if user is not authenticated', async () => {
  // await request(app).delete(path).send({id: })
});
