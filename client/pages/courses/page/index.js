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

import { Edit } from 'helpers/systemIcons'

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
  // let request = new Request(`/api/course/fetch/${ctx.query.id}`)
  //   .get()
  //   .json()
  //   .ctx(ctx);
  // let res = await request.send();

  let { data, meta } = await Request().server
    .course.add(`fetch/${ctx.query.id}`)
    .get
    .json
    .c(ctx)
    .result;

  console.log("course fetch", data)

  console.log("gjeapgjeaigjaep")

  //200 is the expected status code
  let serverErrors = handleErrors(200, [404], data, meta);

  let course = null;
  let phases = [];

  if(!serverErrors) {
    if(data.course) course = data.course;

    //Get phases
    let result = await Request().server
      .phase.add('fetch')
      .body({
        parentCourse: ctx.query.id
      })
      .post
      .json
      .c(ctx)
      .result;


    // let response = await new Request(`/api/phase/fetch`, {
    //   parentCourse: ctx.query.id,
    // })
    //   .post()
    //   .json()
    //   .ctx(ctx)
    //   .send();

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

  //TODO: FIX THIS ERROR HANDLING
  //to replicate: try to go to course page without an id for course
  if(serverErrors) {
    return (
      <div></div>
    )
  }

  const userData = getUserData();

  const { coursePage } = course;

  if(!_phases) _phases = [];

  let [phases, setPhases] = useState(_phases);
  let [phasesRender, setPhasesRender] = useState();

  let [loaderActive, setLoaderActive] = useState(false);

  const editCourseClick = () => {
    setLoaderActive(true)
    router.push(`/courses/page/edit?id=${router.query.id}`);
  };


  //TODO: implement permissions check as well
  const canUserEditPage = (userData.userId === course.owner.userId) ? true : false;

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
    <Layout>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.container}>

          {(canUserEditPage) && (
            <CourseNavigation options={[
              {
                text: lang.editCourse,
                onClick: editCourseClick,
                icon: Edit
              },
            ]} />
          )}

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
