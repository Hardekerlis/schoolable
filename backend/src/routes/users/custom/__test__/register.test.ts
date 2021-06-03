/** @format */

import request from 'supertest';
import { app } from '../../../../app';

it('returns a 201 on succesful registration', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      name: {
        first: 'John',
        second: 'Doe',
      },
      email: 'john.doe@exampleschool.com',
      password: 'password',
    })
    .expect(201);
});
