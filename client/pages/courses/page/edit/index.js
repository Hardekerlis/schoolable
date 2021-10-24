import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import {
  Request,
  handleErrors,
  getUserData,
  Prompt,
  firstLetterToUpperCase,
  getUserDataServer
} from 'helpers';

import Layout from 'layouts/default';

import { WarpBack, PlusClipboard } from 'helpers/systemIcons';

import {
  Sidebar,
  Loader,
  CourseMenuItems,
  CourseNavigation,
  SampleCreationSystem,
  Phase,
  PhaseEditMenu
} from 'components';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import language from 'helpers/lang';
const lang = language.coursePageEdit;

import styles from './edit.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  const userData = getUserDataServer(ctx);

  let request = new Request(`/api/course/fetch/${ctx.query.id}`)
    .get()
    .json()
    .ctx(ctx);
  let res = await request.send();

  //200 is the expected status code
  let serverErrors = handleErrors(200, res, [404]);

  let course = null;
  let phases = [];

  if(!serverErrors) {
    course = res.course;

    if(course.owner.userId !== userData.id) {
      return {
        redirect: {
          destination: '/pageNotFound',
          permanent: false,
        },
      };
    }

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

  return {
    props: {
      course,
      _phases: phases,
      sub: ctx.query.sub,
      serverErrors,
    },
  };
};

const EditCourse = ({ serverErrors, _phases, course, sub }) => {
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

  if(!_phases) _phases = [];

  let [phases, setPhases] = useState(_phases);
  let [phasesRender, setPhasesRender] = useState();

  let [phaseEditMenuOpen, setPhaseEditMenuOpen] = useState(false);
  let [phaseEditMenuInfo, setPhaseEditMenuInfo] = useState({});


  let [loaderActive, setLoaderActive] = useState(false);

  const parsedCourseName = firstLetterToUpperCase(course.name);

  const editCourseClick = () => {
    setLoaderActive(true)
    router.push(`/courses/page/edit?id=${router.query.id}`);
  };

  const goToCourseWhileEditing = () => {
    setLoaderActive(true);
    router.push(`/courses/page?id=${router.query.id}`);
  }

  const setPhaseEditMenuOpenInPhase = (index, name, id) => {
    // console.log("setPhaseEditMenuOpenInPhase")

    setPhaseEditMenuOpen(true);
    setPhaseEditMenuInfo({
      name,
      id,
      index,
    });
  };

  const closePhaseEditMenu = () => {
    setPhaseEditMenuOpen(false);
  };

  const onPhaseCreation = async response => {
    // console.log(response);

    if(response.errors === false) {
      let arr = phases.slice();

      arr.push(response.phase);

      setPhases(arr);

      Prompt.success(lang.phaseCreated);
      return true;
    }else {
      Prompt.error(response.errors);
      return false;
    }

    //return false for error.
  };

  let [phaseTitles, setPhaseTitles] = useState([]);

  const phaseNameChanged = (name, index) => {
    let arr = phaseTitles.slice();
    arr[index] = name;
    setPhaseTitles(arr);
  };

  useEffect(() => {
    if(phaseTitles.length === 0) return;

    //set "phasesRender" here so the phaseTitles have values.

    setPhasesRender(
      phases.map((obj, index) => {
        return (
          <Phase
            index={index}
            setPhaseEditMenuOpen={setPhaseEditMenuOpenInPhase}
            editing={true}
            key={index}
            id={obj.id}
            name={phaseTitles[index]}
          />
        );
      }),
    );
  }, [phaseTitles]);


  useEffect(() => {
    let titles = [];

    for (let obj of phases) {
      titles.push(obj.name);
    }

    setPhaseTitles(titles);
  }, [phases]);

  return (
    <Layout>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.container}>
          {phaseEditMenuOpen && (
            <PhaseEditMenu
              closeMenu={closePhaseEditMenu}
              nameChanged={phaseNameChanged}
              courseId={course.id}
              info={phaseEditMenuInfo}
            />
          )}

          <div className={styles.header}>
            <p className={styles.headline}>
              <span style={{ fontWeight: 300 }}>
                {lang.coursePageTitleEditing}
              </span>
              {parsedCourseName}
            </p>

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
                  text: lang.goBack,
                  onClick: goToCourseWhileEditing,
                  icon: WarpBack
                },
              ]} />
              {sub === 'overview' && (
                <>
                  {phasesRender?.length === 0 ? (
                    <p className={styles.noPhasesText}>{lang.noPhasesText}</p>
                  ) : (
                    <>
                      <p className={styles.phasesText}>{lang.phases}</p>

                      <div className={styles.phasesContainer}>
                        <>
                          <SampleCreationSystem
                            creationContainerClassName={styles.creationContainer}
                            body={{
                              parentCourse: course.id,
                            }}
                            createItemButtonClassName={styles.createPhaseButton}
                            requestCallback={onPhaseCreation}
                            itemApiPath={`/api/phase/create`}
                            currentItems={phases}
                            itemName={lang.phaseItemName}
                            noCurrentItemText={lang.courseMissingPhases}
                            createAdditionalItemIcon={PlusClipboard}
                          />
                        </>

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

export default EditCourse;
