import request from 'supertest';
import { app } from '../../app';

const path = '/api/session/active';

it(`Has a route handler listening on ${path} for get requests`, async () => {
  const res = await request(app).get(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user is not authenticated', async () => {
  await request(app).get(path).send().expect(401);
});

it('Returns a 400 if no sessions are found', async () => {
  const [faultyCookie] = await global.getFaultyAuthCookie();

  await request(app).get(path).set('Cookie', faultyCookie).send().expect(400);
});

it('Removes token cookie if no session is found', async () => {
  const [faultyCookie] = await global.getFaultyAuthCookie();

  const res = await request(app)
    .get(path)
    .set('Cookie', faultyCookie)
    .send()
    .expect(400);

  expect(res.get('Set-Cookie')).toContain(
    'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
});

it('Returns a 200 if sessions are found', async () => {
  const [cookie] = await global.getAuthCookie();

  await request(app).get(path).set('Cookie', cookie).send({}).expect(200);
});

it('Returns a an array with sessions if sessions are found', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .get(path)
    .set('Cookie', cookie)
    .send({})
    .expect(200);

  expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);
});
