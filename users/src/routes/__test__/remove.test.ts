import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/users/remove';

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

it(`Has a route handler listening on ${path} for DELETE requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  await request(app).delete(path).send().expect(401);
});

it('Returns a 401 if user is not an application admin', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app).delete(path).set('Cookie', cookie).send().expect(401);
});

it('Returns a 400 if user id is not present in request body', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app).delete(path).set('Cookie', cookie).send().expect(400);
});

it('Returns a 400 if userId is not an ObjectId', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      userId: 'Not an Object Id',
    })
    .expect(400);
});

it('Returns a 404 if no user is found', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      userId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 405 if an admin is trying to remove the last admin account', async () => {
  const [cookie, user] = await global.getAuthCookie(UserTypes.Admin);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ userId: user.id })
    .expect(405);
});

it('Returns a 200 if an acount is successfully queued to be removed', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);
  const [x, user] = await global.getAuthCookie(UserTypes.Teacher);

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ userId: user.id })
    .expect(200);
});

it('Deletion.removeAt is a date', async () => {
  const [cookie] = await global.getAuthCookie(UserTypes.Admin);
  const [x, user] = await global.getAuthCookie(UserTypes.Teacher);

  const res = await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({ userId: user.id })
    .expect(200);

  expect(
    Object.prototype.toString.call(new Date(res.body.user.deletion.removeAt)),
  ).toEqual('[object Date]');
});
