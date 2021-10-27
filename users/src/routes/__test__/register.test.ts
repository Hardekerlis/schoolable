import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/users/register';

interface Options {
  userType: UserTypes;
  field: string;
  newValue: string | object;
}

interface InvalidUser {
  email: string;
  userType: string;
  name: {
    first: string;
    last: string;
  };
}

const getInvalidUserData = (options: Options): InvalidUser => {
  let data = global.getUserData(options.userType);

  (data as any)[`${options.field}`] = options.newValue;

  return data;
};

it(`Has a route handler listening on ${path} for POST requests`, async () => {
  const res = await request(app).post(path).send({});

  expect(res.status).not.toEqual(404);
});

describe('Registration of first account', () => {
  it('Returns a 400 if email is not present in body', async () => {
    let userData = global.getUserData(UserTypes.Admin);
    delete (userData as any).email;

    await request(app).post(path).send(userData).expect(400);
  });

  it('Returns a 400 if email is invalid', async () => {
    let userData = getInvalidUserData({
      userType: UserTypes.Admin,
      field: 'email',
      newValue: 'invalidemail',
    });

    await request(app).post(path).send(userData).expect(400);
  });

  it('Returns a 400 if user type is not present in body', async () => {
    let userData = global.getUserData(UserTypes.Admin);
    delete (userData as any).userType;

    await request(app).post(path).send(userData).expect(400);
  });

  it('Returns a 400 if user type is not of type admin', async () => {
    let userData = global.getUserData(UserTypes.Teacher);

    await request(app).post(path).send(userData).expect(400);
  });

  it('Returns a 400 if name.first is not present in body', async () => {
    let userData = global.getUserData(UserTypes.Admin);
    delete (userData as any).name.first;

    await request(app).post(path).send(userData).expect(400);
  });

  it('Returns a 400 if name.last is not present in body', async () => {
    let userData = global.getUserData(UserTypes.Admin);
    delete (userData as any).name.last;

    await request(app).post(path).send(userData).expect(400);
  });

  it('Returns a 201 if user is created', async () => {
    let userData = global.getUserData(UserTypes.Admin);

    await request(app).post(path).send(userData).expect(201);
  });

  it('Returns the user object in response body', async () => {
    let userData = global.getUserData(UserTypes.Admin);

    const res = await request(app).post(path).send(userData).expect(201);

    expect(res.body.user).toBeDefined();
  });
});

describe('Registration of all accounts except first', () => {
  it.todo('Returns a 401 if registrator is not authenticated');

  it.todo('Returns a 401 if registrator is not user type admin');

  it.todo('Returns a 400 if email is not present in body');

  it.todo('Returns a 400 if email is invalid');

  it.todo('Returns a 400 if user type is not present in body');

  it.todo('Returns a 400 if user type is not of type admin');

  it.todo('Returns a 400 if name.first is not present in body');

  it.todo('Returns a 400 if name.last is not present in body');

  it.todo('Returns a 201 if user is created');

  it.todo('Returns the user object in response body');
});
