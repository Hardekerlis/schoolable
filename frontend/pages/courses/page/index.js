import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserData from 'helpers/getUserData.js'


import { Prompt } from 'helpers/prompt';

import { CoursePageRender } from 'components';


import styles from './coursePage.module.sass';


export const getServerSideProps = async(ctx) => {

  const { sessionId } = getCookies(ctx);

  let request = new Request(`/api/course/${ctx.query.id}`).get().json().cookie({sessionId});
  let res = await request.send();

  //200 is the expected status code
  const serverErrors = handleErrors(200, res);
  if(serverErrors.isProps) return serverErrors.propsContainer;

  let course;

  if(!serverErrors) {
    course = res.course;
  }

  if(!ctx.query.hasOwnProperty('sub')) {
    ctx.query.sub = 'overview';
  }

  return {
    props: {
      serverErrors,
      course,
      sub: ctx.query.sub
    }
  }

}

const CoursePage = ({ serverErrors, course, sub }) => {

  const router = useRouter();

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  const userData = getUserData();

  const isUserOwnerOfPage = (userData.id === course.owner.id) ? true : false;


  // course.coursePage.description = "a desc"

  return (
    <CoursePageRender isEditing={false} course={course} isUserOwnerOfPage={isUserOwnerOfPage} sub={sub} />
  )

//  <div className={styles.mainDivider}></div>


}


















export default CoursePage;
