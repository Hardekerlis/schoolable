//lib imports

import React, { useState, useEffect } from 'react';

import cookies from 'next-cookies';

//custom imports

import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar, CourseCreation, Dropdown } from 'components'

import getUserData from 'helpers/getUserData.js'


//css imports

import styles from './courses.module.sass';


//!imports

export const getServerSideProps = async(ctx) => {

  const { sessionId } = cookies(ctx);

  let request = new Request('/api/course').get().json().cookie({sessionId});
  let res = await request.send();

  let courses = [];

  //do error handling!!! for eg. unexpected error

  if(res._response.status !== 200) {
    courses = [];
  }else {
    courses = res.courses;
  }

  return {
    props: {
      courses
    }
  }

}


const Courses = ({ courses }) => {

  const userData = getUserData();

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

  const firstLetterToUpperCase = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  useEffect(() => {

    setCoursesForRender(currentCourses.map((course, index) => {

      let courseName = firstLetterToUpperCase(course.name);

      return (
        <div className={styles.course} key={index}>
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

        { userData.userType === "teacher" &&

          <CourseCreation fetchCourses={fetchCourses} currentCourses={currentCourses} setCurrentCourses={setCurrentCourses} />

        }

      </div>

    </Layout>
  )

}

export default Courses;
