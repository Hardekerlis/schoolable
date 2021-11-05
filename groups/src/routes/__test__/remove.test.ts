import request from 'supertest';
import mongoose from 'mongoose';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/groups/remove';

import { natsWrapper } from '../../utils/natsWrapper';

it(`Has a route handler listening on ${path} for delete requests`, async () => {
  const res = await request(app).delete(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authorized', async () => {
  await request(app).delete(path).send().expect(401);
});

it('Returns a 400 if no group id is present in request body', async () => {
  const { cookie } = await global.createGroup();

  await request(app).delete(path).set('Cookie', cookie).send().expect(400);
});

it('Returns a 400 if group id is not a valid ObjectId', async () => {
  const { cookie } = await global.createGroup();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      groupId: 'invalid group id',
    })
    .expect(400);
});

it("Returns a 404 if group can't be found", async () => {
  const { cookie } = await global.createGroup();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      groupId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 200 if group is successfully removed', async () => {
  const { cookie, group } = await global.createGroup();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
    })
    .expect(200);
});

it('Publishes NATS event', async () => {
  const { cookie, group } = await global.createGroup();

  await request(app)
    .delete(path)
    .set('Cookie', cookie)
    .send({
      groupId: group.id,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
