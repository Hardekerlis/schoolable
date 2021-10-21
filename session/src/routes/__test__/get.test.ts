import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

const path = '/api/session/';

it(`Has a route handler listening on ${path} for get requests`, async () => {
  const res = await request(app).get(path).send({});

  expect(res.status).not.toEqual(404);
});

it('Returns a 401 if user has no loginId cookie', async () => {
  await request(app).get(path).send().expect(401);
});

it('Returns a 401 if no session is found with loginId cookie', async () => {
  const [loginIdCookie] = await global.getLoginIdCookie();

  await request(app).get(path).set('Cookie', loginIdCookie).send().expect(401);
});

it('Returns a 200 if a session is found', async () => {
  const { session } = await global.createSession();
  const [loginIdCookie] = await global.getLoginIdCookie(session.loginId);

  await request(app).get(path).set('Cookie', loginIdCookie).send().expect(200);
});

it('Returns a sesstok cookie if a session is found', async () => {
  const { session } = await global.createSession();
  const [loginIdCookie] = await global.getLoginIdCookie(session.loginId);

  const res = await request(app)
    .get(path)
    .set('Cookie', loginIdCookie)
    .send()
    .expect(200);

  expect(res.get('Set-Cookie')).toHaveLength(2);
});

it('Clears loginId cookie', async () => {
  const { session } = await global.createSession();
  const [loginIdCookie] = await global.getLoginIdCookie(session.loginId);

  const res = await request(app)
    .get(path)
    .set('Cookie', loginIdCookie)
    .send()
    .expect(200);

  expect(res.get('Set-Cookie')).toContain(
    'loginId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
});
