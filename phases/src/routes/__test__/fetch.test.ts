import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

const path = '/api/phases/fetch';

import { natsWrapper } from '../../utils/natsWrapper';
import logger from '../../utils/logger';

describe('Fetch many', () => {
  const getPath = (moduleId: string): string => {
    return `${path}?module_id=${moduleId}`;
  };

  it(`Has a route handler listening on ${path} for get requests`, async () => {
    const res = await request(app).get(path).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authorized', async () => {
    await request(app).get(path).send({}).expect(401);
  });

  it('Returns a 401 if user is not owner, admin or student of course', async () => {
    const { _module } = await global.createPhase();
    const { cookie } = await global.getAuthCookie(UserTypes.Teacher);

    await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send()
      .expect(401);
  });

  it('Returns a 404 if no module is found', async () => {
    const { cookie } = await global.getAuthCookie(UserTypes.Teacher);

    await request(app)
      .get(getPath(new mongoose.Types.ObjectId().toHexString()))
      .set('Cookie', cookie)
      .send()
      .expect(404);
  });

  it('Returns a 404 if no phases is found', async () => {
    const { _module, cookie } = await global.createModule();

    await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send()
      .expect(404);
  });

  it('Returns a 404 if module id is a invalid object id', async () => {
    const { cookie } = await global.createPhase();

    await request(app)
      .get(getPath('Invalid object id'))
      .set('Cookie', cookie)
      .send()
      .expect(404);
  });

  it('Returns a 400 if module_id query is not defined in url', async () => {
    const { cookie } = await global.createPhase();

    await request(app).get(path).set('Cookie', cookie).send().expect(400);
  });

  it('Returns all phases of module if user is an application admin', async () => {
    const { _module } = await global.createPhase();
    const { cookie } = await global.getAuthCookie(UserTypes.Admin);

    await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);
  });

  it('Returns 0 phases if no phases are accessible to user', async () => {
    const { _module } = await global.createPhase();
    const { cookie } = await global.getAuthCookie(UserTypes.Teacher);

    const res = await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send();

    expect(res.body.phases).not.toBeDefined();
  });

  it('Returns a 200 if phases are successfully fetched', async () => {
    const { _module, cookie } = await global.createPhase();

    await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);
  });

  it('Returns phases in response body if fetch is successful', async () => {
    const { _module, cookie } = await global.createPhase();

    const res = await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send();

    expect(res.body.phases.length).toBeGreaterThan(0);
  });

  it('Logger is implemented', async () => {
    const { _module, cookie } = await global.createPhase();

    await request(app)
      .get(getPath(_module.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(logger.info).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });
});

describe('Fetch one', () => {
  const getPath = (phaseId: string): string => {
    return `${path}/${phaseId}`;
  };

  it(`Has a route handler listening on ${getPath(
    new mongoose.Types.ObjectId().toHexString(),
  )} (Random ObjectId) for get requests`, async () => {
    const res = await request(app)
      .get(getPath(new mongoose.Types.ObjectId().toHexString()))
      .send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authorized', async () => {
    await request(app)
      .get(getPath(new mongoose.Types.ObjectId().toHexString()))
      .send({})
      .expect(401);
  });

  it('Returns a 401 if user is not owner, admin or student of course', async () => {
    const { _module, phase } = await global.createPhase();
    const { cookie } = await global.getAuthCookie(UserTypes.Teacher);

    await request(app)
      .get(getPath(phase.id))
      .set('Cookie', cookie)
      .send()
      .expect(401);
  });

  it('Returns a 404 if no phase is found', async () => {
    const { phase, cookie } = await global.createPhase();

    await request(app)
      .get(getPath(new mongoose.Types.ObjectId().toHexString()))
      .set('Cookie', cookie)
      .send()
      .expect(404);
  });

  it('Returns a 404 if phase id is a invalid object id', async () => {
    const { cookie } = await global.createPhase();

    await request(app)
      .get(getPath('Invalid object id'))
      .set('Cookie', cookie)
      .send()
      .expect(404);
  });

  it('Returns a 200 if phase is successfully fetched', async () => {
    const { phase, cookie } = await global.createPhase();

    await request(app)
      .get(getPath(phase.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);
  });

  it('Returns phases in response body if fetch is successful', async () => {
    const { phase, cookie } = await global.createPhase();

    const res = await request(app)
      .get(getPath(phase.id))
      .set('Cookie', cookie)
      .send();

    expect(res.body.phase).toBeDefined();
  });

  it('Logger is implemented', async () => {
    const { phase, cookie } = await global.createPhase();

    await request(app)
      .get(getPath(phase.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(logger.info).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });
});
