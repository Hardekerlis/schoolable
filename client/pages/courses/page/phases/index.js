import React, { useState, useEffect } from 'react';

import Layout from 'layouts/default';

import { Sidebar } from 'components';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import Request from 'helpers/request.js';

import styles from './phases.module.sass';

export const getServerSideProps = async ctx => {
  const { sessionId } = getCookies(ctx);

  let res = await new Request('/api/course').get().json().ctx(ctx).send();

  console.log(res);

  let serverErrors = handleErrors(200, res, [404]);

  if(serverErrors === false) {
    // courses = res.courses;
  }

  // console.log("serverErrors", serverErrors)

  return {
    props: {
      serverErrors,
    },
  };
};

const Phases = () => {
  console.log('gpihae');

  return (
    <Layout>
      <div className={styles.wrapper}>
        <Sidebar />
      </div>
    </Layout>
  );
};

export default Phases;
