import React, { useState, useEffect } from 'react';

import { nanoid } from 'nanoid'


import Request from 'helpers/request.js';

import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import getUserData from 'helpers/getUserData.js'

import { firstLetterToUpperCase } from 'helpers/misc.js'

import Layout from 'layouts/default';

import { Prompt } from 'helpers/prompt';

import { Sidebar } from 'components';

import { RightClickIcon } from 'cssIcons'

import styles from './coursePage.module.sass';


export const getServerSideProps = async(ctx) => {

  const { sessionId } = getCookies(ctx);

  let request = new Request(`/api/course/${ctx.query.id}`).get().json().cookie({sessionId});
  let res = await request.send();

  //200 is the expected status code
  const serverErrors = handleErrors(200, res);
  if(serverErrors.isProps) return serverErrors.propsContainer;

  let course;

  if(!serverErrors) {
    course = res.course;
  }

  return {
    props: {
      serverErrors,
      course
    }
  }

}

const CoursePage = ({ serverErrors, course }) => {

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  const userData = getUserData();

  const parsedCourseName = firstLetterToUpperCase(course.name);


  // course.coursePage.description = "a desc"

  let [menuItems, setMenuItems] = useState([]);
  let [menuItemsActions, setMenuItemsActions] = useState([]);

  useEffect(() => {

    let actionsToAdd = [];

    setMenuItems(course.coursePage.menu.map((obj, index) => {

      let className = styles.menuOption;

      if(index === 0) className = `${styles.menuOption} ${styles.menuOptionSelected}`

      let isRightClickable = false;

      let id = "courseMenuId_" + nanoid(8);

      //handle actions
      for(let action of obj.actions) {

        if(action.actionType === 'rightClick') {

          actionsToAdd.push({
            id: id,
            type: 'contextmenu',
            fn: (evt) => {
              evt.preventDefault();
              console.log("gjeapgjae")
            }
          })

          isRightClickable = true;

        }

      }

      return(

        <div id={id} className={className} key={index}>
          <p>{obj.title}</p>
          { isRightClickable &&
            <RightClickIcon className={styles.rightClickIcon} />
          }
        </div>

      )

    }))

    setMenuItemsActions(actionsToAdd)


  }, [])

  useEffect(() => {

    if(menuItemsActions.length !== 0) {

      for(let action of menuItemsActions) {

        document.getElementById(action.id).addEventListener(action.type, action.fn)

      }

    }

  }, [menuItemsActions])

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
            {menuItems}
          </div>


          { course.coursePage.description &&
            <div className={styles.descDivider}>
              <div className={styles.descContainer}>
                <p className={styles.descTitle}>Course description</p>
                <p>{course.coursePage.description}</p>
              </div>
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

//  <div className={styles.mainDivider}></div>


}

export default CoursePage;
