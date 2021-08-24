//lib imports

import React, { useState, useEffect } from 'react';


import { useRouter } from 'next/router';

//custom imports

import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar, CourseCreation, Dropdown } from 'components'

import getUserData from 'helpers/getUserData.js'
import getCookies from 'helpers/getCookiesServer.js'
import handleErrors from 'helpers/handleErrorsServer.js'

import { firstLetterToUpperCase } from 'helpers/misc.js'

//css imports

import styles from './courses.module.sass';


//!imports

export const getServerSideProps = async(ctx) => {

  const { sessionId } = getCookies(ctx);

  let request = new Request('/api/course').get().json().cookie({sessionId});
  let res = await request.send();

  let courses = [];

  const serverErrors = handleErrors(200, res);
  if(serverErrors.isProps) return serverErrors.propsContainer;


  if(serverErrors === false) {
    courses = res.courses;
  }

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

      const courseClick = () => router.push(`/courses/page?id=${course.id}`);

      return (
        <div onClick={courseClick} className={styles.course} key={index}>
          <div className={styles.image}>
            <p className={styles.hoverText}>{courseName}</p>
          </div>
          <div className={styles.textContainer}>
            <p className={styles.name}>{courseName}</p>
            <p className={styles.author}>By: {course.owner.name}</p>
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
      name: 'Default'
    }
  ]

  const onSortMethodChange = (val) => setSortMethod(val.value);


  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />

        { coursesForRender.length !== 0 &&

          <>

            <div className={styles.sortBy}>
              <p className={styles.text}>Sort by:</p>

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

          <CourseCreation fetchCourses={fetchCourses} currentCourses={currentCourses} setCurrentCourses={setCurrentCourses} />

        }

        { (userData.userType === "student" && coursesForRender.length === 0) &&

          <div className={styles.noCoursesStudent}>

            <p>No courses found.</p>
            <p>All of your courses will appear here once they have been created!</p>

          </div>

        }

      </div>

    </Layout>
  )

}

export default Courses;
