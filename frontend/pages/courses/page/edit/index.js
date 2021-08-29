import React, { useState, useEffect } from 'react';

import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserDataServer from 'helpers/getUserDataServer.js'

import Layout from 'layouts/default';

import { Prompt } from 'helpers/prompt';

import { CoursePageRender } from 'components';

import styles from './edit.module.sass';

export const getServerSideProps = async(ctx) => {

  const { sessionId } = getCookies(ctx);

  const userData = getUserDataServer(ctx);

  let request = new Request(`/api/course/${ctx.query.id}`).get().json().cookie({sessionId});
  let res = await request.send();

  //200 is the expected status code
  let serverErrors = handleErrors(200, res);
  if(serverErrors.isProps) return serverErrors.propsContainer;

  let course;

  if(!serverErrors) {
    course = res.course;

    if(course.owner.id !== userData.id) {

      return (
        {
          redirect: {
            destination: '/pageNotFound',
            permanent: false,
          }
        }
      )

    }

  }

  return {
    props: {
      course,
      serverErrors
    }
  }

}

const EditCourse = ({ serverErrors, course }) => {

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
    //maybe add another render (return) if serverErrors
  }

  return(
    <CoursePageRender isEditing={true} course={course} />
  )

}
















export default EditCourse;
