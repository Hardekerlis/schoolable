import React, { useState, useEffect } from 'react';

import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserData from 'helpers/getUserData.js'

import { firstLetterToUpperCase } from 'helpers/misc.js'

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

  const userData = getUserData();

  const parsedCourseName = firstLetterToUpperCase(course.name);

  console.log(course)

  course.coursePage.description = "a desc"

  let [menuItems, setMenuItems] = useState([]);

  useEffect(() => {

    setMenuItems(course.coursePage.menu.map((obj, index) => {

      console.log(obj)

      return(

        <div className={styles.menuOption}>
          <p>{obj.title}</p>
        </div>

      )

    }))

  }, [])

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

          { course.coursePage.description &&
            <div className={styles.descDivider}>
              <div className={styles.descContainer}>
                <p>{course.coursePage.description}</p>
              </div>
            </div>
          }

          <div className={styles.mainContainer}>

            <div className={styles.content}>



            </div>

            <div className={styles.mainDivider}></div>

            <div className={styles.courseMenu}>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  )

}

export default CoursePage;
