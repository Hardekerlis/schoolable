/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../../app';
import { UserTypes } from '../../../../../../library';

const path = '/api/course/%courseId%/%phaseId%/%phaseItemId%';

it('Returns a 401 if user is not authenticated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({
      name: 'First phase',
    })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      `/api/course/${res.body.course.id}/${phaseRes.body.phase.id}/createPhaseItem`,
    )
    .set('Cookie', cookie)
    .send({ name: 'First phase item' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', phaseRes.body.phase.id)
        .replace('%phaseItemId%', phaseItemRes.body.phaseItem.id),
    )
    .send({
      paragraphs: ['<p>Foo</p>'],
    })
    .expect(401);
});

it('Returns a 401 if user is not a teacher or admin', async () => {
  const [teacherCookie] = await global.getAuthCookie();
  const [studentCookie] = await global.getAuthCookie(UserTypes.Student);

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', teacherCookie)
    .send({ name: 'Math' })
    .expect(201);

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', teacherCookie)
    .send({
      name: 'First phase',
    })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      `/api/course/${res.body.course.id}/${phaseRes.body.phase.id}/createPhaseItem`,
    )
    .set('Cookie', teacherCookie)
    .send({ name: 'First phase item' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', phaseRes.body.phase.id)
        .replace('%phaseItemId%', phaseItemRes.body.phaseItem.id),
    )
    .set('Cookie', studentCookie)
    .send({
      paragraphs: ['<p>Foo</p>'],
    })
    .expect(401);
});

it("Returns a 401 if user tries to create a phaseItem insade a course which it doesn't own", async () => {
  const [teacherCookie1] = await global.getAuthCookie();
  const [teacherCookie2] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', teacherCookie1)
    .send({ name: 'Math' })
    .expect(201);

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', teacherCookie1)
    .send({
      name: 'First phase',
    })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      `/api/course/${res.body.course.id}/${phaseRes.body.phase.id}/createPhaseItem`,
    )
    .set('Cookie', teacherCookie1)
    .send({ name: 'First phase item' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', phaseRes.body.phase.id)
        .replace('%phaseItemId%', phaseItemRes.body.phaseItem.id),
    )
    .set('Cookie', teacherCookie2)
    .send({
      paragraphs: ['<p>Foo</p>'],
    })
    .expect(401);
});

it("Returns a 400 if user is trying to edit a phaseItem that doesn't exist", async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({
      name: 'First phase',
    })
    .expect(201);

  await request(app)
    .post(
      `/api/course/${res.body.course.id}/${phaseRes.body.phase.id}/createPhaseItem`,
    )
    .set('Cookie', cookie)
    .send({ name: 'First phase item' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', phaseRes.body.phase.id)
        .replace(
          '%phaseItemId%',
          mongoose.Types.ObjectId() as unknown as string,
        ),
    )
    .set('Cookie', cookie)
    .send({
      paragraphs: ['<p>Foo</p>'],
    })
    .expect(400);
});

it('Returns a 200 if phaseItem is successfully updated', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({
      name: 'First phase',
    })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      `/api/course/${res.body.course.id}/${phaseRes.body.phase.id}/createPhaseItem`,
    )
    .set('Cookie', cookie)
    .send({ name: 'First phase item' })
    .expect(201);

  await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', phaseRes.body.phase.id)
        .replace('%phaseItemId%', phaseItemRes.body.phaseItem.id),
    )
    .set('Cookie', cookie)
    .send({
      paragraphs: ['<p>Foo</p>'],
    })
    .expect(200);
});

it('Returns updated phaseItem if update is successful', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' })
    .expect(201);

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({
      name: 'First phase',
    })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      `/api/course/${res.body.course.id}/${phaseRes.body.phase.id}/createPhaseItem`,
    )
    .set('Cookie', cookie)
    .send({ name: 'First phase item' })
    .expect(201);

  const phaseItemUpdateRes = await request(app)
    .put(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phaseId%', phaseRes.body.phase.id)
        .replace('%phaseItemId%', phaseItemRes.body.phaseItem.id),
    )
    .set('Cookie', cookie)
    .send({
      paragraphs: ['<p>Foo</p>'],
    })
    .expect(200);

  expect(phaseItemRes.body.phaseItem).not.toEqual(
    phaseItemUpdateRes.body.phaseItem,
  );
});
