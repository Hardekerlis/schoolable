/** @format */

import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on succesfully creating the first admin account', async () => {
  return request(app)
    .post('/api/setup/adminAccount')
    .send({
      email: 'test@test.com',
      name: {
        first: 'John',
        last: 'Doe',
      },
      publicRsaKey: 'sadasdsadasd',
    });
});
