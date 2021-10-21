//lib imports

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

//custom imports

import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import {
  Sidebar,
  CoursePreview,
  SampleCreationSystem,
  Dropdown,
  Loader
} from 'components';

// import getUserData from 'helpers/getUserData.js';

import { Permission, getUserData } from 'helpers';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import lang from 'helpers/lang';

//css imports

import styles from './courses.module.sass';

//!imports

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  let request = new Request('/api/course/fetch').post().json().ctx(ctx);
  let res = await request.send();

  console.log(res)

  let courses = [];

  const serverErrors = handleErrors(200, res, [404]);

  if(serverErrors === false) {
    courses = res.courses;
    console.log(courses, "no error")
  }

  return {
    props: {
      courses,
      serverErrors,
    },
  };
};

const Courses = ({ courses, serverErrors }) => {
  const userData = getUserData();

  // userData.userType = "student"

  const router = useRouter();

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  let [loaderActive, setLoaderActive] = useState(false);

  let [currentCourses, setCurrentCourses] = useState(courses);
  let [coursesForRender, setCoursesForRender] = useState([]);

  useEffect(() => {
    setCoursesForRender(
      currentCourses.map((course, index) => {
        return <CoursePreview setLoaderActive={setLoaderActive} course={course} key={index} />;
      }),
    );
  }, [currentCourses]);

  let [sortMethod, setSortMethod] = useState('default');

  const sortOptions = [
    {
      value: 'az',
      name: 'A-Z',
    },
    {
      value: 'za',
      name: 'Z-A',
    },
    {
      value: 'default',
      name: lang.courses.sortDefaultName,
    },
  ];

  const onSortMethodChange = val => setSortMethod(val.value);

  const onCourseCreation = async response => {

    if(response.errors === false) {

      setLoaderActive(true)

      router.push(`/courses/page/edit?id=${response.course.id}`);

      // let newCourses = courses.concat([response.course]);
      //
      // setCurrentCourses(newCourses)

      Prompt.success(lang.courses.courseCreated);

      return true;
    }else {
      Prompt.error(response.errors);

      return false;
    }
  };

  return (
    <Layout>
      <div className={styles.wrapper}>
        <Loader active={loaderActive} />
        <Sidebar />

        {coursesForRender.length !== 0 && (
          <div className={styles.container}>
            <p className={styles.pageTitle}>Courses</p>

            <div className={styles.sortBy}>
              <p className={styles.text}>{lang.courses.sortBy}</p>

              <Dropdown
                options={sortOptions}
                className={styles.dropdown}
                optionClassName={styles.dropdownOption}
                menuClassName={styles.dropdownMenu}
                defaultValue={sortOptions[2].value}
                onChange={onSortMethodChange}
                height={'35px'}
              />
            </div>

            <div className={styles.courses}>{coursesForRender}</div>
          </div>
        )}

        {Permission().atLeast('teacher') && (
          <SampleCreationSystem
            firstWrapperClassName={styles.firstWrapperCourseCreation}
            requestCallback={onCourseCreation}
            itemApiPath={`/api/course/create`}
            currentItems={currentCourses}
            itemName={lang.courses.courseItemName}
            noCurrentItemText={lang.courses.noCoursesOwned}
          />
        )}

        {Permission().max('tempTeacher') && coursesForRender.length === 0 && (
          <div className={styles.noCoursesStudent}>
            <p>{lang.courses.noCoursesFound}</p>
            <p>{lang.courses.noCoursesFoundHelper}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
