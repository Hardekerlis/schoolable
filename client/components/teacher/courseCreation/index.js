import React, { useState, useEffect } from 'react';

import styles from './courseCreation.module.sass';

import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CourseCreation = ({
  fetchCourses,
  currentCourses,
  setCurrentCourses,
}) => {
  let courseCreationRef = React.useRef();

  let [newCourseCreation, setNewCourseCreation] = useState(false);
  let [newCourseName, setNewCourseName] = useState('');

  const createNewCourse = () => {
    setNewCourseCreation(true);
  };

  const closeCourseCreation = () => {
    setNewCourseCreation(false);
  };

  useEffect(() => {
    if(newCourseCreation) {
      courseCreationRef.current?.classList.add(`${styles.creationOpen}`);
    }else {
      courseCreationRef.current?.classList.remove(`${styles.creationOpen}`);
    }
  }, [newCourseCreation]);

  const newCourseNameChange = evt => {
    setNewCourseName(evt.target.value);
  };

  let [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const courseCreationSubmit = async evt => {
    evt.preventDefault();

    if(isCreatingCourse) return;

    setIsCreatingCourse(true);

    let request = new Request('/api/course/create', { name: newCourseName })
      .post()
      .json();
    let response = await request.send();

    if(response.errors === false) {
      //course created

      await fetchCourses();

      setNewCourseName('');
      setNewCourseCreation(false);

      Prompt.success('Course created!');
    }else {
      Prompt.error(response.errors);
    }

    setIsCreatingCourse(false);
  };

  return (
    <>
      {currentCourses.length === 0 ? (
        <>
          <div className={styles.createFirstCourseWrapper}>
            <div onClick={createNewCourse} className={styles.createFirstCourse}>
              <FontAwesomeIcon className={styles.plus} icon={faPlus} />
              <p>Create course</p>
            </div>
            <p className={styles.helperText}>
              You currently don’t own any courses. <br /> Create one to start!
            </p>
          </div>
        </>
      ) : (
        <>
          <div onClick={createNewCourse} className={styles.createCourse}>
            <FontAwesomeIcon className={styles.plus} icon={faPlus} />
            <p>Create course</p>
          </div>
        </>
      )}

      <div ref={courseCreationRef} className={styles.newCourseCreation}>
        <form onSubmit={courseCreationSubmit}>
          <input
            onChange={newCourseNameChange}
            value={newCourseName}
            autoFocus
            placeholder='Course name'
          />
          <div className={styles.buttonContainer}>
            <button type='button' onClick={closeCourseCreation}>
              Exit
            </button>
            <button type='submit'>Create</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CourseCreation;
