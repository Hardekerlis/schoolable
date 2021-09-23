import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'

import styles from './sidebar.module.sass';

import { faUser, faHome, faLandmark, faBook, faCalendar, faCaretLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import language from 'helpers/lang';
const lang = language.sidebar;

import UserMenu from './userMenu'

const SidebarOption = ({name, path, icon, onClick, iconSize, current, arrowEnabled}) => {

  if(!iconSize) iconSize = "50%";
  if(!path) path = '/' + name.toLowerCase();

  if(typeof path === 'object') {
    for(let p of path) {
      if(p === current) {
        path = p;
        break;
      }
    }
  }

  let myClassName = (path === current) ? `${styles.option} ${styles.current}` : `${styles.option}`;


  if(arrowEnabled === undefined) arrowEnabled = true

  return (
    <div onClick={onClick} className={myClassName}>
      <FontAwesomeIcon style={{width: iconSize, height: iconSize}} className={styles.icon} icon={icon} />

        {arrowEnabled &&
          <div className={styles.select}>
            <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
            {name}
          </div>
        }

    </div>
  )

}

const Sidebar = () => {

  const router = useRouter();

  //think this one through
  let [current, setCurrent] = useState(router.pathname);
  //!!

  let [userMenuOpen, setUserMenuOpen] = useState(false);

  const navTo = (href) => {

    if(current === href) return;

    //is this necessary? !!
    setCurrent(href);
    //!!

    router.push(href);

  }

  //arrowEnabled on userMenu must be dependent on UserMenu
  //component
  return (
    <>
      <div className={styles.wrapper}>
        <SidebarOption arrowEnabled={!userMenuOpen} onClick={() => setUserMenuOpen(!userMenuOpen)} iconSize={"40%"} name={lang.user} icon={faUser} />
        <SidebarOption path={["/", "/home"]} onClick={() => navTo('/')} current={current} name={lang.home} icon={faHome} />
        <SidebarOption onClick={() => navTo('/courses')} current={current} name={lang.courses} icon={faLandmark} />
        <SidebarOption current={current} iconSize={"40%"} name={lang.assignments} icon={faBook} />
        <SidebarOption onClick={() => navTo('/calendar')} current={current} iconSize={"40%"} name={lang.schedule} icon={faCalendar} />
      </div>
      <UserMenu setUserMenuOpen={setUserMenuOpen} open={userMenuOpen} />
    </>
  )

}

export default Sidebar;
