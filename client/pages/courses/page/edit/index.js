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

  let { data, meta } = await Request().server
    .course.add(`fetch/${ctx.query.id}`)
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
  let phases = [];

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
      .phase.add('fetch')
      .post
      .json
      .c(ctx)
      .body({
        parentCourseId: ctx.query.id
      })
      .result;

    serverErrors = handleErrors(200, [404], result.data, result.meta);

    if(!serverErrors) {
      phases = result.data.phases;
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
            setLoaderActive={setLoaderActive}
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
    <Layout title={`${lang.layoutTitle} ${course.name}`}>
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
              setLoaderActive={setLoaderActive}
            />
          )}

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
                  text: lang.goBack,
                  onClick: goToCourseWhileEditing,
                  icon: WarpBack
                },
              ]} />
              {sub === 'overview' && (
                <>
                  <p className={styles.phasesText}>{lang.phases}</p>

                  <div className={styles.phasesContainer}>
                    <>
                      <SampleCreationSystem
                        creationContainerClassName={styles.creationContainer}
                        body={{
                          parentCourseId: course.id,
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// {phasesRender?.length === 0 ? (
//   <p className={styles.noPhasesText}>{lang.noPhasesText}</p>
// ) : (
//   <>
//     <p className={styles.phasesText}>{lang.phases}</p>
//
//     <div className={styles.phasesContainer}>
//       <>
//         <SampleCreationSystem
//           creationContainerClassName={styles.creationContainer}
//           body={{
//             parentCourseId: course.id,
//           }}
//           createItemButtonClassName={styles.createPhaseButton}
//           requestCallback={onPhaseCreation}
//           itemApiPath={`/api/phase/create`}
//           currentItems={phases}
//           itemName={lang.phaseItemName}
//           noCurrentItemText={lang.courseMissingPhases}
//           createAdditionalItemIcon={PlusClipboard}
//         />
//       </>
//
//       {phasesRender}
//     </div>
//   </>
// )}

export default EditCourse;
