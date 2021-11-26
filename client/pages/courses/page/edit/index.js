import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import {
  Request,
  handleErrors,
  Prompt,
  firstLetterToUpperCase,
  getUserDataServer
} from 'helpers';

import Layout from 'layouts/default';

import {
  WarpBack,
  PlusClipboard,
  Checkmark,
  Crossmark
} from 'helpers/systemIcons';

import {
  Sidebar,
  Loader,
  CourseMenuItems,
  CourseNavigation,
  SampleCreationSystem,
  EditableModule,
} from 'components';

import {
  Overview,
  Modules,
} from 'components/editCoursePage';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import language from 'helpers/lang';
const lang = language.coursePageEdit;

import styles from './edit.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  const userData = getUserDataServer(ctx);

  let { data, meta } = await Request().server
    .courses.add(`fetch/${ctx.query.id}`)
    .get
    .json
    .c(ctx)
    .result;

  if(meta.status === 404) {
    return {
      redirect: {
        destination: '/pageNotFound',
        permanent: false
      }
    }
  }

  //200 is the expected status code
  let serverErrors = handleErrors(200, [404], data, meta);

  let course = null;
  let modules = [];

  if(!serverErrors) {
    course = data.course;

    //TODO: implement permissions check as well
    if(course.owner.id !== userData.userId) {
      return {
        redirect: {
          destination: '/pageNotFound',
          permanent: false,
        },
      };
    }

    //Get phases

    let result = await Request().server
      .modules.add('fetch')
      .post
      .json
      .c(ctx)
      .body({
        parentCourseId: ctx.query.id
      })
      .result;

    console.log(result)

    serverErrors = handleErrors(200, [404], result.data, result.meta);

    if(!serverErrors) {
      console.log(result.data)
      modules = result.data.modules;
    }
  }

  if(!ctx.query.hasOwnProperty('sub')) {
    ctx.query.sub = 'overview';
  }

  return {
    props: {
      course,
      _modules: modules,
      sub: ctx.query.sub,
      serverErrors,
    },
  };
};

const EditCourse = ({ serverErrors, _modules, course, sub }) => {
  if(serverErrors !== false) {
    Prompt.error(serverErrors);
    //maybe add another render (return) if serverErrors
    return (
      <Layout>
        <Sidebar />
      </Layout>
    );
  }

  const router = useRouter();

  const { coursePage } = course;

  let [loaderActive, setLoaderActive] = useState(false);

  const parsedCourseName = firstLetterToUpperCase(course.name);



  const saveClick = () => {
    console.log("save all changes");
  }

  const cancelClick = () => {
    setLoaderActive(true);
    router.push(`/courses/page?id=${router.query.id}&sub=${sub}`);
  }

  return (
    <Layout title={`${lang.layoutTitle} ${course.name}`}>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headline}>
              <p className={styles.editing}>
                {lang.coursePageTitleEditing}
              </p>
              {parsedCourseName}
            </div>

            <p className={styles.authorText}>
              {course.owner.name.first} {course.owner.name.last}
            </p>
          </div>

          <div className={`hoz_line ${styles.hoz_line}`}></div>

          <div className={styles.courseMenu}>
            <CourseMenuItems
              isEditing={true}
              styles={styles}
              course={course}
              sub={sub}
            />
          </div>

          {course.coursePage.description && (
            <div className={styles.descDivider}>
              <div className={styles.descContainer}>
                <p className={styles.descTitle}>{lang.descriptionTitle}</p>
                <p>{course.coursePage.description}</p>
              </div>
            </div>
          )}

          <div className={styles.mainContainer}>
            <div className={styles.content}>
              <CourseNavigation options={[ 
                {
                  text: lang.cancel,
                  onClick: cancelClick,
                  icon: Crossmark,
                  className: styles.cancel
                },
                {
                  text: lang.save,
                  onClick: saveClick,
                  icon: Checkmark,
                  className: styles.save
                },
              ]} />
              {sub === 'overview' &&
                <Overview />
              }
              {sub === 'modules' &&
                <Modules course={course} _modules={_modules} />
              }
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};


// {[
//   {
//     text: lang.goBack,
//     onClick: cancelClick,
//     icon: WarpBack,
//     className: styles.cancel
//   },
// ]}




export default EditCourse;
