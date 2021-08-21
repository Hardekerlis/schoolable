import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'

import styles from './sidebar.module.sass';

import { faUser, faHome, faLandmark, faBook, faCalendar, faCaretLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import UserMenu from './userMenu'

const SidebarOption = ({name, path, icon, onClick, iconSize, current, arrowEnabled}) => {

  if(!iconSize) iconSize = "50%";
  if(!path) path = '/' + name.toLowerCase();

  let myClassName = (path === current) ? `${styles.option} ${styles.current}` : `${styles.option}`;
  // if(addClassName) myClassName += ` ${addClassName}`;

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

  const toggleUserMenu = () => {

    setUserMenuOpen(!userMenuOpen);

  }

  const setUserMenu = (boolean) => {
    setUserMenuOpen(boolean);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <SidebarOption arrowEnabled={!userMenuOpen} onClick={toggleUserMenu} iconSize={"40%"} name={"User"} icon={faUser} />
        <SidebarOption path={"/"} onClick={() => navTo('/home')} current={current} name={"Home"} icon={faHome} />
        <SidebarOption onClick={() => navTo('/courses')} current={current} name={"Courses"} icon={faLandmark} />
        <SidebarOption current={current} iconSize={"40%"} name={"Assignments"} icon={faBook} />
        <SidebarOption current={current} iconSize={"40%"} name={"Schedule"} icon={faCalendar} />
      </div>
      <UserMenu setUserMenu={setUserMenu} open={(userMenuOpen)} />
    </>
  )

}

export default Sidebar;
