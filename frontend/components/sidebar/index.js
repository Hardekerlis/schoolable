import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'



import styles from './sidebar.module.sass';

import { faHome, faLandmark, faBook, faCalendar, faCaretLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SidebarOption = ({name, icon, onClick, iconSize}) => {

  if(!iconSize) iconSize = "50%";

  return (
    <div onClick={onClick} className={styles.option}>
      <FontAwesomeIcon style={{width: iconSize, height: iconSize}} className={styles.icon} icon={icon} />
      <div className={styles.select}>
        <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
        {name}
      </div>
    </div>
  )

}

const Sidebar = () => {

  const router = useRouter();

  const homeClick = () => {
    router.push('/');
  }

  const coursesClick = () => {
    router.push('/courses');
  }

  return (
    <div className={styles.wrapper}>
      <SidebarOption onClick={homeClick} name={"Home"} icon={faHome} />
      <SidebarOption onClick={coursesClick} name={"Courses"} icon={faLandmark} />
      <SidebarOption iconSize={"40%"} name={"Assignments"} icon={faBook} />
      <SidebarOption iconSize={"40%"} name={"Schedule"} icon={faCalendar} />

    </div>
  )

}

export default Sidebar;
