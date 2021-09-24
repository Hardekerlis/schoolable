import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/auth/login';

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

  const { user, tempPassword } = body;

  const { email, id } = user;

  return { email, password: tempPassword, id };
};

it('Returns a 400 if email is invalid', async () => {
  const { password } = await registerUser(UserTypes.Teacher);

  await request(app)
    .post(path)
    .send({
      email: 'notvalid.email',
      password,
    })
    .expect(400);
});

it('Returns a 400 if no password is supplied', async () => {
  const { email } = await registerUser(UserTypes.Teacher);

  await request(app)
    .post(path)
    .send({
      email,
    })
    .expect(400);
});

it('Returns a 400 if no user is found', async () => {
  await request(app)
    .post(path)
    .send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })
    .expect(400);
});

it("Returns error message 'Wrong credentials' if no user is found", async () => {
  const res = await request(app)
    .post(path)
    .send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('Wrong credentials');
});

it('Returns a 400 if password is wrong', async () => {
  const { email } = await registerUser(UserTypes.Teacher);

  await request(app)
    .post(path)
    .send({
      email,
      password: faker.internet.password(),
    })
    .expect(400);
});

it("Returns error message 'Wrong credentials' if password is wrong", async () => {
  const { email } = await registerUser(UserTypes.Teacher);

  const res = await request(app)
    .post(path)
    .send({
      email,
      password: faker.internet.password(),
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('Wrong credentials');
});

it('Returns a 200 if login is successful', async () => {
  const { email, password } = await registerUser(UserTypes.Teacher);

  await request(app).post(path).send({ email, password }).expect(200);
});

it('Sets a cookie if login is successful', async () => {
  const { email, password } = await registerUser(UserTypes.Teacher);

  const res = await request(app)
    .post(path)
    .send({ email, password })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});

it('Expect the users settings to be returned on login', async () => {
  const { email, password } = await registerUser(UserTypes.Teacher);

  const res = await request(app)
    .post(path)
    .send({ email, password })
    .expect(200);

  expect(res.body.user.settings).toBeDefined();
});
