import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import {
  Request,
  handleErrors,
  getUserData,
  Prompt,
  firstLetterToUpperCase
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
  let request = new Request(`/api/course/fetch/${ctx.query.id}`)
    .get()
    .json()
    .ctx(ctx);
  let res = await request.send();

  console.log("course fetch", res)

  console.log("gjeapgjeaigjaep")

  //200 is the expected status code
  let serverErrors = handleErrors(200, res, [404]);

  let course = null;
  let phases = [];

  if(!serverErrors) {
    course = res.course;

    //Get phases
    let response = await new Request(`/api/phase/fetch`, {
      parentCourse: ctx.query.id,
    })
      .post()
      .json()
      .ctx(ctx)
      .send();

    serverErrors = handleErrors(200, response, [404]);

    if(!serverErrors) {
      phases = response.phases;
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

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
    return (
      <Layout>
        <Sidebar />
      </Layout>
    );
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
  const canUserEditPage = (userData.id === course.owner.userId) ? true : false;



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
