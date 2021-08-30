import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';


import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Layout from 'layouts/default';

import { Prompt } from 'helpers/prompt';

import { Sidebar, CourseMenuItems } from 'components';

import { firstLetterToUpperCase } from 'helpers/misc.js'


import styles from './coursePageRender.module.sass';

const CoursePageRender = ({ isEditing, course, isUserOwnerOfPage, sub }) => {

  const router = useRouter();
  

  const parsedCourseName = firstLetterToUpperCase(course.name);

  const editCourseClick = () => {

    router.push(`/courses/page/edit?id=${router.query.id}`);

  }

  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />

        <div className={styles.container}>

          <div className={styles.header}>
            <p className={styles.headline}>{parsedCourseName}</p>
            <p className={styles.authorText}>{course.owner.name}</p>
          </div>

          <div className={`hoz_line ${styles.hoz_line}`}></div>

          <div className={styles.courseMenu}>
            <CourseMenuItems styles={styles} course={course} sub={sub} />
          </div>


          { course.coursePage.description &&
            <div className={styles.descDivider}>
              <div className={styles.descContainer}>
                <p className={styles.descTitle}>Course description</p>
                <p>{course.coursePage.description}</p>
              </div>
            </div>
          }

          { (isUserOwnerOfPage && isEditing === false) &&

            <div onClick={editCourseClick} className={styles.editCourse}>
              <FontAwesomeIcon icon={faEdit} className={styles.icon} />
              <p>Edit course</p>
            </div>

          }

          <div className={styles.mainContainer}>

            <div className={styles.content}>



            </div>

          </div>

        </div>

      </div>

    </Layout>
  )

}


export default CoursePageRender;
