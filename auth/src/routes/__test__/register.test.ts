import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '../../utils/usertypes.enum';

const path = '/api/auth/register';

interface ValidUser {
  email: string;
  userType: UserTypes;
  name: string;
}

const getUserData = (userType: UserTypes): ValidUser => {
  return {
    email: faker.internet.email(),
    userType: userType,
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };
};

it("Returns a 401 if user registering account isn't of type Admin", async () => {
  const [teacherCookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .post(path)
    .set('Cookie', teacherCookie)
    .send(getUserData(UserTypes.Student));
});

it('Returns a 400 if email is invalid', async () => {});

it('Returns a 400 if password is too short', async () => {});

it('Returns a 400 if first name is not defined', async () => {});

it("Returns a 400 if last name isn't defined", async () => {});

it('Returns a 201 if user is registered', async () => {});
