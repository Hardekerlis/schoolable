import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';


import { faEdit, faFileAlt, faPen, faPenSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Layout from 'layouts/default';

import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';

import { Sidebar, CourseMenuItems, SampleCreationSystem, Phase, PhaseEditMenu } from 'components';

import { firstLetterToUpperCase } from 'helpers/misc.js'

import language from 'helpers/lang';
const lang = language.coursePage;

import styles from './coursePageRender.module.sass';

const CoursePageRender = ({ isEditing, course, isUserOwnerOfPage, sub }) => {

  const router = useRouter();

  const { coursePage } = course;

  let [phases, setPhases] = useState(coursePage.phases);
  let [phasesRender, setPhasesRender] = useState();

  let [phaseEditMenuOpen, setPhaseEditMenuOpen] = useState(false);
  let [phaseEditMenuInfo, setPhaseEditMenuInfo] = useState({});

  const parsedCourseName = firstLetterToUpperCase(course.name);

  const editCourseClick = () => {

    router.push(`/courses/page/edit?id=${router.query.id}`);

  }


  const setPhaseEditMenuOpenInPhase = (index, name, id) => {

    console.log("setPhaseEditMenuOpenInPhase")

    setPhaseEditMenuOpen(true);
    setPhaseEditMenuInfo({
      name,
      id,
      index
    })

  }

  const closePhaseEditMenu = () => {
    console.log("closing phaseeditmenu")
    setPhaseEditMenuOpen(false);
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



  let [phaseTitles, setPhaseTitles] = useState([]);

  const phaseNameChanged = (name, index) => {

    let arr = phaseTitles.slice();
    arr[index] = name;
    setPhaseTitles(arr);

  }

  useEffect(() => {
    if(phaseTitles.length === 0) return;
    if(!isEditing) return;

    //if the user is editing the page
    //set "phasesRender" here so the phaseTitles have values.

    setPhasesRender(phases.map((obj, index) => {
      return (
        <Phase index={index} setPhaseEditMenuOpen={setPhaseEditMenuOpenInPhase} editing={true} key={index} id={obj.id} name={phaseTitles[index]} />
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
          <Phase editing={false} key={index} id={obj.id} name={obj.name} />
        )
      }))

    }

  }, [phases])

  return (
    <Layout>

      <div className={styles.wrapper}>

        { isEditing &&

          <>

            <SampleCreationSystem requestCallback={onPhaseCreation} itemApiPath={`/api/course/${course.id}/createPhase`} currentItems={phases} itemName={lang.phaseItemName} noCurrentItemText={lang.courseMissingPhases} />

          </>

        }

        <Sidebar />

        <div className={styles.container}>

          { (phaseEditMenuOpen && isEditing) &&
            <PhaseEditMenu closeMenu={closePhaseEditMenu} nameChanged={phaseNameChanged} courseId={course.id} info={phaseEditMenuInfo} />
          }

          <div className={styles.header}>
            { isEditing ?
                <p className={styles.headline}>{parsedCourseName}</p>
              :
                <p className={styles.headline}><span style={{fontWeight: 300}}>{lang.coursePageTitleEditing}</span>{parsedCourseName}</p>
            }

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

            { // isEditing &&
            //
            //   <div className={styles.changesSaveStatus}>
            //
            //     { phaseChangesSaved ?
            //
            //       <p>Changes saved.</p>
            //
            //       :
            //
            //       <p>Saving changes...</p>
            //
            //
            //     }
            //
            //   </div>

            }



            <div className={styles.content}>



              { sub === "overview" &&

                <>

                  { phasesRender?.length === 0 ?

                      <p>No phases</p>

                    :

                      <>

                        <p className={styles.phasesText}>{lang.phases}</p>

                        <div className={styles.phasesContainer}>



                          {phasesRender}

                        </div>

                      </>

                  }



                </>

              }



            </div>

          </div>

        </div>

      </div>

    </Layout>
  )

}

// { isEditing === false &&
//   <div className={styles.phaseDivider}></div>
// }

export default CoursePageRender;
