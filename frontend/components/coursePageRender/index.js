import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';


import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Layout from 'layouts/default';

import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';

import { Sidebar, CourseMenuItems, SampleCreationSystem, Phase } from 'components';

import { firstLetterToUpperCase } from 'helpers/misc.js'

import language from 'helpers/lang';
const lang = language.coursePage;

import styles from './coursePageRender.module.sass';

const CoursePageRender = ({ isEditing, course, isUserOwnerOfPage, sub }) => {

  const router = useRouter();

  const { coursePage } = course;

  let [phases, setPhases] = useState(coursePage.phases);
  let [phasesRender, setPhasesRender] = useState();

  let [phaseChangesSaved, setPhaseChangesSaved] = useState(true);
  let phaseChanges = 0;

  const parsedCourseName = firstLetterToUpperCase(course.name);

  const editCourseClick = () => {

    router.push(`/courses/page/edit?id=${router.query.id}`);

  }


  const onPhaseCreation = async(response) => {
    // console.log(response);

    if(response.errors === false) {

      let arr = phases.slice();

      arr.push(response.phase);

      setPhases(arr);


      Prompt.success(lang.phaseCreated)
      return true;
    }else {
      Prompt.error(response.errors)
      return false;
    }

    //return false for error.

  }

  const handlePhaseChanges = (num) => {

    phaseChanges += num;

    if(phaseChanges !== 0) {
      setPhaseChangesSaved(false);
    }else if(phaseChanges === 0) {
      setPhaseChangesSaved(true);
    }

  }

  const updateTitleOnServer = async(value, phaseIndex) => {

    handlePhaseChanges(1);

    let phaseId = phases[phaseIndex].id;

    let req = new Request(`/api/course/${course.id}/${phaseId}`, {
      name: value
    }).json().put();
    let res = await req.send();

    handlePhaseChanges(-1);

  }

  let [phaseTitles, setPhaseTitles] = useState([]);

  const onPhaseTitleChange = (evt, index) => {

    let arr = phaseTitles.slice();
    arr[index] = evt.target.value;
    setPhaseTitles(arr);

    updateTitleOnServer(evt.target.value, index);

  }

  useEffect(() => {
    if(phaseTitles.length === 0) return;
    if(!isEditing) return;

    //if the user is editing the page
    //set "phasesRender" here so the phaseTitles have values.

    setPhasesRender(phases.map((obj, index) => {
      return (
        <div className={styles.phaseEdit} key={index}>
          <p className={styles.name}>{phaseTitles[index]}</p>
          <div className={styles.editBtn}>
            <p>Edit</p>
          </div>
        </div>
      )
    }))

  }, [phaseTitles])


// <div className={styles.phaseEdit} key={index}>
//   <div className={styles.textContainer}>
//     <p>{lang.phaseNameEdit}</p>
//     <input onChange={(event) => onPhaseTitleChange(event, index)} value={phaseTitles[index]} />
//   </div>
//   <div className={styles.edit}>
//     <p>{lang.editPhaseText}</p>
//   </div>
// </div>


  //make spinning thingy that tells the user when all their changes have saved

  useEffect(() => {

    if(isEditing) {

      let titles = [];

      for(let obj of phases) {
        titles.push(obj.name);
      }

      setPhaseTitles(titles);

    }else {

      setPhasesRender(phases.map((obj, index) => {
        return (
          <Phase key={index} name={obj.name} />
        )
      }))

    }

  }, [phases])

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
                <p className={styles.descTitle}>{lang.descriptionTitle}</p>
                <p>{course.coursePage.description}</p>
              </div>
            </div>
          }

          { (isUserOwnerOfPage && isEditing === false) &&

            <div onClick={editCourseClick} className={styles.editCourse}>
              <FontAwesomeIcon icon={faEdit} className={styles.icon} />
              <p>{lang.editCourse}</p>
            </div>

          }

          <div className={styles.mainContainer}>

            { isEditing &&

              <div className={styles.changesSaveStatus}>

                { phaseChangesSaved ?

                  <p>Changes saved.</p>

                  :

                  <p>Saving changes...</p>


                }

              </div>

            }

            <div className={styles.content}>

              { isEditing &&

                <>
                  <SampleCreationSystem requestCallback={onPhaseCreation} itemApiPath={`/api/course/${course.id}/createPhase`} currentItems={phases} itemName={lang.phaseItemName} noCurrentItemText={lang.courseMissingPhases} />

                </>

              }

              {phasesRender}

            </div>

          </div>

        </div>

      </div>

    </Layout>
  )

}


export default CoursePageRender;
