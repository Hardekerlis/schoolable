/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../../app';
import { UserTypes } from '../../../../../../library';

const path = '/api/course/%courseId%/%phase%/createPhaseItem';

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

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .send({ name: 'First phase item' })
    .expect(401);
});

it('Returns a 401 if user is not a teacher or admin', async () => {
  const [studentCookie] = await global.getAuthCookie(UserTypes.Student);
  const [teacherCookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', teacherCookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', teacherCookie)
    .send({ name: 'First phase' })
    .expect(201);

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', studentCookie)
    .send({ name: 'First phase item' })
    .expect(401);
});

it("Returns a 401 if user tries to create a phaseItem insade a phase which it doesn't own", async () => {
  const [teacherCookie1] = await global.getAuthCookie();
  const [teacherCookie2] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', teacherCookie1)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', teacherCookie1)
    .send({ name: 'First phase' })
    .expect(201);

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', teacherCookie2)
    .send({ name: 'First phase item' })
    .expect(401);
});

it('Returns a 400 if no name is supplied', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({ name: 'First phase' })
    .expect(201);

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it("Returns a 400 if user is trying to create a phaseItem for a phase that doesn't exist", async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({ name: 'First phase' })
    .expect(201);

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', mongoose.Types.ObjectId() as unknown as string),
    )
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('Returns a 201 if phaseItem is created', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({ name: 'First phase' })
    .expect(201);

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({
      name: 'First phaseItem',
    })
    .expect(201);
});

it('Returns phaseItem if it is successfully created', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({ name: 'First phase' })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({
      name: 'First phaseItem',
    })
    .expect(201);

  expect(phaseItemRes.body.phaseItem).toHaveProperty('name');
});

it('Phase is locked and not visible', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({ name: 'First phase' })
    .expect(201);

  const phaseItemRes = await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({
      name: 'First phaseItem',
    })
    .expect(201);

  expect(phaseItemRes.body.phaseItem.locked).toEqual(true);
  expect(phaseItemRes.body.phaseItem.visible).toEqual(false);
});

import Course from '../../../../../../models/course';
it('Returns 2 phaseItems from course if 2 phaseItems are created', async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: 'Math' });

  const phaseRes = await request(app)
    .post(`/api/course/${res.body.course.id}/createPhase`)
    .set('Cookie', cookie)
    .send({ name: 'First phase' })
    .expect(201);

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({
      name: 'First phaseItem',
    });

  await request(app)
    .post(
      path
        .replace('%courseId%', res.body.course.id)
        .replace('%phase%', phaseRes.body.phase.id),
    )
    .set('Cookie', cookie)
    .send({
      name: 'Second phaseItem',
    });

  const course = await Course.findById(res.body.course.id).populate({
    path: 'coursePage',
    populate: {
      path: 'phases',
      populate: {
        path: 'phaseItems',
      },
    },
  });

  // @ts-ignore
  expect(course.coursePage.phases[0].phaseItems.length).toEqual(2);
});
