import React, { useState, useEffect } from 'react';

import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import Layout from 'layouts/default';

import { Prompt } from 'helpers/prompt';

import { Sidebar } from 'components';

import styles from './coursePage.module.sass';


export const getServerSideProps = async(ctx) => {

  const { sessionId } = getCookies(ctx);

  let request = new Request(`/api/course/${ctx.query.id}`).get().json().cookie({sessionId});
  let res = await request.send();

  const serverErrors = handleErrors(200, res);
  if(serverErrors.isProps) return serverErrors.propsContainer;

  let course;

  if(!serverErrors) {
    course = res.course;
  }

  return {
    props: {
      serverErrors,
      course
    }
  }

}

const CoursePage = ({ serverErrors, course }) => {

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  console.log(course)

  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />

      </div>

    </Layout>
  )

}

export default CoursePage;
