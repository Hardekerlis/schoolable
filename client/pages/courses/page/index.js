import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import {
  Request,
  handleErrors,
  getUserData,
  Prompt,
  firstLetterToUpperCase,
  ErrorHandler
} from 'helpers';

import Layout from 'layouts/default/';

import {
  Edit,
  WarpBack
 } from 'helpers/systemIcons'

import {
  Sidebar,
  Loader,
  CourseMenuItems,
  CourseNavigation,
} from 'components';

import {
  Overview,
  Modules
} from 'components/coursePage';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import language from 'helpers/lang';
const lang = language.coursePage;

import styles from './coursePage.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  //Get course data. Not modules first.

  let { data, meta } = await Request().server
    .course.add(`fetch/${ctx.query.id}`)
    .get
    .json
    .c(ctx)
    .result;

  //200 is the expected status code
  let serverErrors = handleErrors(200, [404], data, meta);

  if(meta.status === 404) {
    return {
      redirect: {
        destination: '/pageNotFound',
        permanent: false,
      },
    }
  }

  let course = null;
  let modules = [];

  if(!serverErrors) {
    if(data.course) course = data.course;

    //Get phases - change to module
    let result = await Request().server
      .phase.add('fetch')
      .body({
        parentCourseId: ctx.query.id
      })
      .post
      .json
      .c(ctx)
      .result;

    serverErrors = handleErrors(200, [404], result.data, result.meta);

    if(!serverErrors) {
      modules = result.data.phases; //change to modules
    }
  }

  if(!ctx.query.hasOwnProperty('sub')) {
    ctx.query.sub = 'overview';
  }

  console.log("wazzzzzup")

  return {
    props: {
      serverErrors,
      course,
      _modules: modules,
      sub: ctx.query.sub,
    },
  };
};

const CoursePage = ({ serverErrors, course, _modules, sub }) => {
  const router = useRouter();

  ErrorHandler(serverErrors);

  //TODO: FIX THIS ERROR HANDLING

  //requireQueries
  //to replicate: try to go to course page without an id for course
  if(serverErrors || !course) {
    return (
      <div></div>
    )
  }

  const userData = getUserData();

  const coursePage = course?.coursePage;

  let [loaderActive, setLoaderActive] = useState(false);


  const editCourseClick = () => {
    setLoaderActive(true)
    router.push(`/courses/page/edit?id=${router.query.id}&sub=${sub}`);
  };


  //TODO: implement permissions check as well
  const canUserEditPage = (userData.userId === course.owner.id) ? true : false;

  let courseNavigationOptions = [
    {
      text: lang.goBack,
      onClick: () => {
        setLoaderActive(true);
        router.push(`/courses`)
      },
      icon: WarpBack
    },
  ];

  if(canUserEditPage) courseNavigationOptions.push(
    {
      text: lang.editCourse,
      onClick: editCourseClick,
      icon: Edit
    }
  )

  const parsedCourseName = firstLetterToUpperCase(course.name);

  return (
    <Layout title={course.name}>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.container}>

          <CourseNavigation options={courseNavigationOptions} />

          <div className={styles.header}>
            <p className={styles.headline}>{parsedCourseName}</p>
            <p className={styles.authorText}>
              {course.owner.name.first} {course.owner.name.last}
            </p>
          </div>

          <div className={`hoz_line ${styles.hoz_line}`}></div>

          <div className={styles.courseMenu}>
            <CourseMenuItems
              isEditing={false}
              styles={styles}
              course={course}
              sub={sub}
            />
          </div>

          {coursePage.description && (
            <div className={styles.descDivider}>
              <div className={styles.descContainer}>
                <p className={styles.descTitle}>{lang.descriptionTitle}</p>
                <p>{course.coursePage.description}</p>
              </div>
            </div>
          )}

          <div className={styles.mainContainer}>
            <div className={styles.content}>
              {sub === 'overview' &&
                <Overview />
              }
              {sub === 'modules' &&
                <Modules _modules={_modules} setLoaderActive={setLoaderActive} />
              }
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;
