import React, { useState, useEffect } from 'react';

import Image from 'next/image';

import Layout from 'layouts/default';

import { Sidebar } from 'components';

import { Icons } from 'helpers';


import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import Request from 'helpers/request.js';

import styles from './phases.module.sass';

export const getServerSideProps = async ctx => {

  let res = await new Request(`/api/phase/fetch/${ctx.query.phase}`, {
    parentCourse: ctx.query.id
  }).post().json().ctx(ctx).send();

  let serverErrors = handleErrors(200, res, [404]);

  let phase = {};
  let courseName = '';

  if(serverErrors === false) {
    phase = res.phase;

    //fetch course name

    let request = new Request(`/api/course/fetch/${ctx.query.id}`)
      .get()
      .json()
      .ctx(ctx);
    let response = await request.send();

    serverErrors = handleErrors(200, response, [404]);

    if(serverErrors === false) {
      courseName = response.course.name;
    }

  }

  return {
    props: {
      serverErrors,
      phase,
      courseName,
    },
  };
};

const Phases = ({ serverErrors, phase, courseName }) => {

  //TODO: track which course name is associated with this phase
  //else get it from an api call

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  return (
    <Layout>
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.page}>

          <div className={styles.breadcrumbs}>
            <p className={styles.course}>{courseName}</p>
            { Icons.RightArrow() }
            <p className={styles.name}>{phase.name}</p>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Phases;
