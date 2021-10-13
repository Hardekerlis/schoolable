import React, { useState, useEffect } from 'react';

import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserDataServer from 'helpers/getUserDataServer.js'

import Layout from 'layouts/default';

import { Prompt } from 'helpers/prompt';

import { CoursePageRender, Sidebar } from 'components';

import styles from './edit.module.sass';

export const getServerSideProps = async(ctx) => {

  const userData = getUserDataServer(ctx);

  let request = new Request(`/api/course/fetch/${ctx.query.id}`).get().json().ctx(ctx);
  let res = await request.send();

  //200 is the expected status code
  let serverErrors = handleErrors(200, res, [404]);

  let course = null;
  let phases = [];

  if(!serverErrors) {
    course = res.course;

    if(course.owner.userId !== userData.id) {

      return (
        {
          redirect: {
            destination: '/pageNotFound',
            permanent: false,
          }
        }
      )

    }

    //Get phases
    let response = await (new Request(`/api/phase/fetch`, {
      parentCourse: ctx.query.id
    }).post().json().ctx(ctx)).send();

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
      course,
      phases,
      sub: ctx.query.sub,
      serverErrors
    }
  }

}

const EditCourse = ({ serverErrors, phases, course, sub }) => {

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
    //maybe add another render (return) if serverErrors
    return (
      <Layout>
        <Sidebar />


      </Layout>
    )
  }

  console.log(sub, 81)

  return(
    <CoursePageRender isEditing={true} coursePhases={phases} course={course} sub={sub} />
  )

}

export default EditCourse;
