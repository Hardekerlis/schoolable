import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';



import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserData from 'helpers/getUserData.js'

import { firstLetterToUpperCase } from 'helpers/misc.js'

import Layout from 'layouts/default';

import { Prompt } from 'helpers/prompt';

import { Sidebar, CourseMenuItems } from 'components';


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

  const parsedCourseName = firstLetterToUpperCase(course.name);


  // course.coursePage.description = "a desc"

  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />

        <div className={styles.container}>

          <div className={styles.header}>
            <p className={styles.headline}>{parsedCourseName}</p>
            <p className={styles.authorText}>{course.owner.name}</p>
          </div>

          <div className={`hoz_line ${styles.hoz_line}`}></div>

          <div className={styles.courseMenu}>
            <CourseMenuItems styles={styles} course={course} sub={sub} />
          </div>


          { course.coursePage.description &&
            <div className={styles.descDivider}>
              <div className={styles.descContainer}>
                <p className={styles.descTitle}>Course description</p>
                <p>{course.coursePage.description}</p>
              </div>
            </div>
          }

          <div className={styles.mainContainer}>

            <div className={styles.content}>



            </div>

          </div>

        </div>

      </div>

    </Layout>
  )

//  <div className={styles.mainDivider}></div>


}

export default CoursePage;
