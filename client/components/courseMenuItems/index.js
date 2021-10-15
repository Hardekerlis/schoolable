import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { nanoid } from 'nanoid';

import language from 'helpers/lang';
const lang = language.courseMenu;

import { RightClickMenu } from 'components';

import { RightClickIcon } from 'cssIcons';

import styles from './courseMenuItems.module.sass';

const CourseMenuItems = ({ course, sub, isEditing }) => {

  const router = useRouter();

  let [menuItems, setMenuItems] = useState([]);
  let [editingItems, setEditingItems] = useState([]);
  let [isCreatingItem, setIsCreatingItem] = useState(null);
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

      if(obj.title === "Overview") obj.title = lang.overview;

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

            }else {

              console.warn("unhandled action. action:", action)

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

  useEffect(() => {

    if(isCreatingItem) {



    }

  }, [isCreatingItem])

  const onCreateItemClick = () => {
    if(!isCreatingItem) setIsCreatingItem(true);
  }

  //TODO: Remove the unnecessary options when a preset is selected.

  const menuPresets = [
    {
      name: 'Create new subpage',
      // prompt: ['title'] //every menuItem requires a title
      dependencies: [
        ["actions[0].goTo", 'value']
      ],
      actions: [
        {
          actionType: 'leftClick',
          goTo: 'this.{value}'
        }
      ]
    }
  ]

  let [newItem, setNewItem] = useState({
    title: '',
    actions: []
  })

  const updateTitle = (e) => {
    setNewItem({
      ...newItem,
      title: e.target.value
    })
  }

  const createMenuItem = (e) => {
    e.preventDefault();



  }

  const choosePreset = (index) => {
    console.log("index", index)
  }

  const menuPresetsRender = menuPresets.map((obj, index) => {

    return (
      <div onClick={() => choosePreset(index)} key={index} className={styles.preset}>
        <p>{obj.name}</p>
      </div>
    )

  })

  return(
    <>
      {isEditing ?
        <>
          { menuItems }
          <div onClick={onCreateItemClick} className={`${styles.menuOption} ${styles.plusOption}`} key={'createNewItem'}>
            <FontAwesomeIcon className={styles.plusIcon} icon={faPlus} />
          </div>
          { isCreatingItem &&
            <div className={styles.creatingMenuItem}>
              <div className={styles.container}>
                <p className={styles.headline}>Create new menu item</p>
                <div className={styles.inner}>
                  <p className={styles.title}>Presets</p>
                  <div className={styles.wrapper}>
                    {menuPresetsRender}
                  </div>
                  <p className={styles.title}>Information</p>
                  <div className={styles.wrapper}>
                    <form onSubmit={createMenuItem}>
                      <p className={styles.text}>Title</p>
                      <input placeholder="Enter title..." onChange={updateTitle} value={newItem.title} />
                    </form>
                  </div>
                </div>
                <div className={`${styles.close} ${styles.btn}`}>
                  <p>Close</p>
                </div>
                <div className={`${styles.create} ${styles.btn}`}>
                  <p>Create</p>
                </div>
              </div>
            </div>
          }
        </>
        :
        <>
          {menuItems}
        </>
      }
    </>
  )

}



export default CourseMenuItems;
