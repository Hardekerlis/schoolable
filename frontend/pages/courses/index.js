//lib imports

import React, { useState, useEffect } from 'react';


import { useRouter } from 'next/router';

//custom imports

import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar, SampleCreationSystem, Dropdown } from 'components'

import getUserData from 'helpers/getUserData.js';
import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import { firstLetterToUpperCase } from 'helpers/misc.js';

import lang from 'helpers/lang';

//css imports

import styles from './courses.module.sass';


//!imports

export const getServerSideProps = async(ctx) => {

  const { sessionId } = getCookies(ctx);

  let request = new Request('/api/course').get().json().cookie({sessionId});
  let res = await request.send();

  // console.log(res)

  let courses = [];

  const serverErrors = handleErrors(200, res);
  if(serverErrors.isProps) return serverErrors.propsContainer;


  if(serverErrors === false) {
    courses = res.courses;
  }

  // console.log("serverErrors", serverErrors)

  return {
    props: {
      courses,
      serverErrors
    }
  }

}


const Courses = ({ courses, serverErrors }) => {

  const userData = getUserData();

  // userData.userType = "student"

  const router = useRouter();

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  let [currentCourses, setCurrentCourses] = useState(courses);
  let [coursesForRender, setCoursesForRender] = useState([]);

  const fetchCourses = async() => {

    let request = new Request('/api/course').get().json();
    let response = await request.send();

    if(response.errors === false) {

      courses = response.courses;

      setCurrentCourses(courses)

    }else {
      Prompt.error(response.errors);
    }

  }

  useEffect(() => {

    setCoursesForRender(currentCourses.map((course, index) => {

      let courseName = firstLetterToUpperCase(course.name);

      const courseClick = () => router.push(`/courses/page?id=${course.id}&sub=overview`);

      return (
        <div onClick={courseClick} className={styles.course} key={index}>
          <div className={styles.image}>
            <p className={styles.hoverText}>{courseName}</p>
          </div>
          <div className={styles.textContainer}>
            <p className={styles.name}>{courseName}</p>
            <p className={styles.author}>{lang.courses.authorPrefix} {course.owner.name}</p>
          </div>
        </div>
      )

    }))

  }, [currentCourses])

  let [sortMethod, setSortMethod] = useState('default');

  const sortOptions = [
    {
      value: 'az',
      name: 'A-Z'
    },
    {
      value: 'za',
      name: 'Z-A'
    },
    {
      value: 'default',
      name: lang.courses.sortDefaultName
    }
  ]

  const onSortMethodChange = (val) => setSortMethod(val.value);

  const onCourseCreation = async(response) => {

    if(response.errors === false) {

      await fetchCourses();

      Prompt.success(lang.courses.courseCreated);

      return true;

    }else {

      Prompt.error(response.errors);

      return false;
    }

  }

  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />

        { coursesForRender.length !== 0 &&

          <>

            <div className={styles.sortBy}>
              <p className={styles.text}>{lang.courses.sortBy}</p>

              <Dropdown
                options={sortOptions}
                className={styles.dropdown}
                optionClassName={styles.dropdownOption}
                menuClassName={styles.dropdownMenu}
                defaultValue={sortOptions[2].value}
                onChange={onSortMethodChange}
                height={"35px"}
              />

            </div>

            <div className={styles.courses}>

              {coursesForRender}

            </div>

          </>

        }

        { userData.userType === "teacher" &&

          <SampleCreationSystem firstWrapperClassName={styles.firstWrapperCourseCreation} requestCallback={onCourseCreation} itemApiPath={`/api/course/create`} currentItems={currentCourses} itemName={lang.courses.courseItemName} noCurrentItemText={lang.courses.noCoursesOwned} />

        }

        { (userData.userType === "student" && coursesForRender.length === 0) &&

          <div className={styles.noCoursesStudent}>

            <p>{lang.courses.noCoursesFound}</p>
            <p>{lang.courses.noCoursesFoundHelper}</p>

          </div>

        }

      </div>

    </Layout>
  )
}

export default Courses;
