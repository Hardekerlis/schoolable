import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserData from 'helpers/getUserData.js';

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { CoursePageRender, Sidebar } from 'components';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import styles from './coursePage.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;
  

  console.log(ctx.query.id);

  //Get course data. Not phases.
  let request = new Request(`/api/course/fetch/${ctx.query.id}`)
    .get()
    .json()
    .ctx(ctx);
  let res = await request.send();

  // console.log(res)

  //200 is the expected status code
  let serverErrors = handleErrors(200, res, [404]);

  let course = null;
  let phases = [];

  if(!serverErrors) {
    course = res.course;

    //Get phases
    let response = await new Request(`/api/phase/fetch`, {
      parentCourse: ctx.query.id,
    })
      .post()
      .json()
      .ctx(ctx)
      .send();

    serverErrors = handleErrors(200, response, [404]);

    if(!serverErrors) {
      phases = response.phases;
    }
  }

  if(!ctx.query.hasOwnProperty('sub')) {
    ctx.query.sub = 'overview';
  }

  return {
    props: {
      serverErrors,
      course,
      phases,
      sub: ctx.query.sub,
    },
  };
};

const CoursePage = ({ serverErrors, course, phases, sub }) => {
  const router = useRouter();

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
    return (
      <Layout>
        <Sidebar />
      </Layout>
    );
  }

  const userData = getUserData();

  const isUserOwnerOfPage = userData.id === course.owner.userId ? true : false;

  console.log(phases);

  return (
    <CoursePageRender
      isEditing={false}
      coursePhases={phases}
      course={course}
      isUserOwnerOfPage={isUserOwnerOfPage}
      sub={sub}
    />
  );
};

export default CoursePage;
