import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/course/fetch';

const createCourse = async () => {
  const [cookie] = await global.getAuthCookie();

  const res = await request(app)
    .post('/api/course/create')
    .set('Cookie', cookie)
    .send({ name: faker.company.companyName() });

  return { course: res.body.course, cookie };
};

const getPath = (id?: String) => {
  if (id) return `${path}/${id}`;

  return path;
};

describe('Fetch many courses. CoursePage is not populated in this case', () => {
  it(`Has a route handler listening on ${getPath()} for post requests`, async () => {
    const res = await request(app).post(getPath()).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not signed in', async () => {
    await request(app).post(getPath()).send({});
  });

  it('Returns 0 courses if user has no courses assigned to user', async () => {
    await createCourse();
    const [cookie] = await global.getAuthCookie();

    const res = await request(app)
      .post(getPath())
      .set('Cookie', cookie)
      .send({})
      .expect(404);

    expect(res.body.courses).toHaveLength(0);
  });

  it('Returns courses to admin even if no courses are assigned to admin', async () => {
    await createCourse();

    const [cookie] = await global.getAuthCookie(UserTypes.Admin);

    const res = await request(app)
      .post(getPath())
      .set('Cookie', cookie)
      .send({})
      .expect(200);

    expect(res.body.courses).toHaveLength(1);
  });

  it('Returns a 404 if no courses are found', async () => {
    const [cookie] = await global.getAuthCookie();

    const res = await request(app)
      .post(getPath())
      .set('Cookie', cookie)
      .send({})
      .expect(404);
  });

  it('Returns a 200 if courses are found', async () => {
    const { cookie } = await createCourse();

    await request(app)
      .post(getPath())
      .set('Cookie', cookie)
      .send({})
      .expect(200);
  });

  it('Returns courses in body if courses are found', async () => {
    const { cookie } = await createCourse();

    const res = await request(app)
      .post(getPath())
      .set('Cookie', cookie)
      .send({})
      .expect(200);

    expect(res.body.courses).toHaveLength(1);
  });
});

describe('Fetch a single course. CoursePage is populated in this case', () => {
  it(`Has a route handler listening on ${getPath(
    'exampleCourseId',
  )} for get requests`, async () => {
    const res = await request(app).get(getPath('exampleCourseId')).send({});

    expect(res.status).not.toEqual(404);
  });

  it('Returns a 401 if user is not authenticated', async () => {
    const { course } = await createCourse();

    await request(app).get(getPath(course.id)).send().expect(401);
  });

  it('Returns a 404 if no course is found', async () => {
    const [cookie] = await global.getAuthCookie();
    await request(app)
      .get(getPath('notexistingcourse'))
      .set('Cookie', cookie)
      .send()
      .expect(404);
  });

  it('Returns a 200 if course is found and coursePage is populated', async () => {
    const { cookie, course } = await createCourse();

    await request(app)
      .get(getPath(course.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);
  });

  it('If courseId is populated in body populate coursePage in response', async () => {
    const { cookie, course } = await createCourse();

    const res = await request(app)
      .get(getPath(course.id))
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(res.body.course.coursePage.menu[0]).toBeDefined();
  });
});
