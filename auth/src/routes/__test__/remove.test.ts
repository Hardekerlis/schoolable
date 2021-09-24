import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/auth/remove';

interface ValidUser {
  email: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
}

const getUserData = (userType: UserTypes): ValidUser => {
  return {
    email: faker.internet.email(),
    userType: userType,
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
  };
};

interface RegisteredUser {
  email: string;
  password: string;
  id: string;
}

const registerUser = async (userType: UserTypes): Promise<RegisteredUser> => {
  const [adminCookie] = await global.getAuthCookie(UserTypes.Admin);
  const path = '/api/auth/register';

  const { body } = await request(app)
    .post(path)
    .set('Cookie', adminCookie)
    .send(getUserData(userType))
    .expect(201);

  const { user } = body;

  const { email, tempPassword, id } = user;

  return { email, password: tempPassword, id };
};

it('Returns a 401 if user is not an admin', async () => {
  const [teacherCookie] = await global.getAuthCookie(UserTypes.Teacher);

  const { id } = await registerUser(UserTypes.Teacher);

  await request(app)
    .delete(path)
    .set('Cookie', teacherCookie)
    .send({ id })
    .expect(401);
});

it.todo('Returns a 405 if an admin is trying to remove the last admin account');

it.todo('Returns a 200 if account is successfully removed');
