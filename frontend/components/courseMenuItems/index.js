import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';


import { nanoid } from 'nanoid';

import { RightClickIcon } from 'cssIcons'

import styles from './courseMenuItems.module.sass'

const CourseMenuItems = ({ course, sub }) => {

  const router = useRouter();

  let [menuItems, setMenuItems] = useState([]);
  let [menuElemInfo, setMenuElemInfo] = useState([])
  let [menuItemsActions, setMenuItemsActions] = useState([]);

  //render menuItems, does not handle actions.
  useEffect(() => {

    let elemInfos = [];

    setMenuItems(course.coursePage.menu.map((obj, index) => {

      let className = styles.menuOption;

      if(obj.value === sub) className = `${styles.menuOption} ${styles.menuOptionSelected}`

      let isRightClickable = false;

      let id = "courseMenuId_" + nanoid(8);

      let menuActions = [];

      let actionIndex = 0;
      for(let action of obj.actions) {

        let internalType = '';

        switch(action.actionType) {
          case 'rightClick':
            internalType = 'contextmenu';
            isRightClickable = true;
            break;
          case 'leftClick':
            internalType = 'click';
            break;
          default:
            console.warn("invalid or unhandled actionType: " + action.actionType);
            internalType = 'click';
            break;
        }

        menuActions[actionIndex] = {
          internalType
        }

        actionIndex++;

      }

      elemInfos.push({
        id,
        menuActions
      })

      return(

        <div id={id} className={className} key={index}>
          <p>{obj.title}</p>
          { isRightClickable &&
            <RightClickIcon className={styles.rightClickIcon} />
          }
        </div>

      )

    }))

    setMenuElemInfo(elemInfos);

  }, [sub])

  //handle menuItems action here.
  useEffect(() => {

    if(menuElemInfo.length === 0) return;

    let actionsToAdd = [];

    course.coursePage.menu.map((obj, index) => {

      const elemInfo = menuElemInfo[index];

      //handle actions

      let actionIndex = 0;
      for(let action of obj.actions) {

        actionsToAdd.push({
          id: elemInfo.id,
          type: elemInfo.menuActions[actionIndex].internalType,
          fn: (evt) => {
            evt.preventDefault();

            if(action.hasOwnProperty("goTo")) {

              parseActionGoTo(action.goTo);

            }

          }
        })

        actionIndex++;

      }

    })

    setMenuItemsActions(actionsToAdd)

  }, [menuElemInfo])

  const parseActionGoTo = (path) => {

    if(path.includes('this.')) {
      //redirect to a subpage in this course
      path = path.replace('this.', '');

      router.push(`${router.pathname}?id=${router.query.id}&sub=${path}`)

    }else {
      console.warn('unhandled path (goTo menu action)');
    }

  }

  useEffect(() => {

    if(menuItemsActions.length !== 0) {

      for(let action of menuItemsActions) {

        let elem = document.getElementById(action.id);

        if(!elem) continue;

        elem.addEventListener(action.type, action.fn)

      }

    }

  }, [menuItemsActions])

  return(
    menuItems
  )

}



export default CourseMenuItems;
