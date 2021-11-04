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
  Phase
} from 'components';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import language from 'helpers/lang';
const lang = language.coursePage;

import styles from './coursePage.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  //Get course data. Not phases.

  let { data, meta } = await Request().server
    .course.add(`fetch/${ctx.query.id}`)
    .get
    .json
    .c(ctx)
    .result;

  console.log(ctx.query.id);

  console.log("course fetch", data)

  console.log("gjeapgjeaigjaep", meta)

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
  let phases = [];

  if(!serverErrors) {
    console.log(data)
    if(data.course) course = data.course;

    //Get phases
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
      phases = result.data.phases;
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
      _phases: phases,
      sub: ctx.query.sub,
    },
  };
};

const CoursePage = ({ serverErrors, course, _phases, sub }) => {
  const router = useRouter();

  ErrorHandler(serverErrors);

  console.log(serverErrors)

  //TODO: FIX THIS ERROR HANDLING
  //to replicate: try to go to course page without an id for course
  if(serverErrors || !course) {
    return (
      <div></div>
    )
  }

  const userData = getUserData();

  // const { coursePage } = course;
  const coursePage = course?.coursePage;

  if(!_phases) _phases = [];

  let [phases, setPhases] = useState(_phases);
  let [phasesRender, setPhasesRender] = useState();

  let [loaderActive, setLoaderActive] = useState(false);

  const editCourseClick = () => {
    setLoaderActive(true)
    router.push(`/courses/page/edit?id=${router.query.id}`);
  };


  //TODO: implement permissions check as well
  const canUserEditPage = (userData.userId === course.owner.id) ? true : false;

  let courseNavigationOptions = [
    {
      text: 'Go back',
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


  useEffect(() => {
    console.log("gjeao")
    console.log(phases)
    setPhasesRender(
      phases.map((obj, index) => {
        return (
          <Phase setLoaderActive={setLoaderActive} editing={false} key={index} id={obj.id} name={obj.name} />
        );
      }),
    );
  }, [phases]);

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
              {sub === 'overview' && (
                <>
                  {phasesRender?.length === 0 ? (
                    <p className={styles.noPhasesText}>{lang.noPhasesText}</p>
                  ) : (
                    <>
                      <p className={styles.phasesText}>{lang.phases}</p>

                      <div className={styles.phasesContainer}>
                        {phasesRender}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;
