import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

const getPath = (id: string) => {
  return '/api/sessions/' + id;
};

describe('Functionality for path ending with "current"', () => {
  const path = getPath('current');
  it(`Has a route handler listening on ${path} for delete requests`, async () => {
    const res = await request(app).delete(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    await request(app).delete(path).send().expect(401);
  });

  it('Returns a 404 if no session is found in database', async () => {
    await global.createSession();

    const [cookie] = await global.getFaultyAuthCookie();

    await request(app).delete(path).set('Cookie', cookie).send().expect(404);
  });

  it('Removes cookie if session is not found in database', async () => {
    await global.createSession();

    const [cookie] = await global.getFaultyAuthCookie();

    const res = await request(app)
      .delete(path)
      .set('Cookie', cookie)
      .send()
      .expect(404);

    expect(res.get('Set-Cookie')).toContain(
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
  });

  it('Returns a 200 if session is found and killed', async () => {
    const [cookie] = await global.getAuthCookie();

    await request(app).delete(path).set('Cookie', cookie).send().expect(200);
  });

  it('Removes token cookie if session is found and killed', async () => {
    const [cookie] = await global.getAuthCookie();

    const res = await request(app)
      .delete(path)
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(res.get('Set-Cookie')).toContain(
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
  });
});

describe('Functionality for path ending with "all"', () => {
  const path = getPath('all');
  it(`Has a route handler listening on ${path} for delete requests`, async () => {
    const res = await request(app).delete(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    await request(app).delete(path).send().expect(401);
  });

  it('Returns a 404 if no sessions are found in database', async () => {
    await global.createSession();

    const [cookie] = await global.getFaultyAuthCookie();

    await request(app).delete(path).set('Cookie', cookie).send().expect(404);
  });

  it('Removes cookie if session is not found in database', async () => {
    await global.createSession();

    const [cookie] = await global.getFaultyAuthCookie();

    const res = await request(app)
      .delete(path)
      .set('Cookie', cookie)
      .send()
      .expect(404);

    expect(res.get('Set-Cookie')).toContain(
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
  });

  it('Returns a 200 if sessions are found and killed', async () => {
    const [cookie] = await global.getAuthCookie();

    await request(app).delete(path).set('Cookie', cookie).send().expect(200);
  });

  it('Removes token cookie if sessions are found and killed', async () => {
    const [cookie] = await global.getAuthCookie();

    const res = await request(app)
      .delete(path)
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(res.get('Set-Cookie')).toContain(
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
  });
});

describe(`Functionality for path ending with "${new mongoose.Types.ObjectId()}" (Random ObjectId)`, () => {
  it(`Has a route handler listening on ${getPath(
    'exmapleId',
  )} for delete requests`, async () => {
    const res = await request(app).delete(getPath('exmapleId')).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { session } = await global.createSession();

    await request(app).delete(getPath(session.id)).send().expect(401);
  });

  it('Returns a 404 if no session is found in database', async () => {
    const [cookie] = await global.getAuthCookie();

    await request(app)
      .delete(getPath(new mongoose.Types.ObjectId().toHexString()))
      .set('Cookie', cookie)
      .expect(404);
  });

  it('Removes a 200 if session is found and killed', async () => {
    const [cookie, session] = await global.getAuthCookie();

    await request(app)
      .delete(getPath(session.id))
      .set('Cookie', cookie)
      .expect(200);
  });
});
