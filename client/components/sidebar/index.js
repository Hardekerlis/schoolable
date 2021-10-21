import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import styles from './sidebar.module.sass';

import {
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  Calendar,
  Home,
  Book,
  Bookmark,
  Avatar
} from 'helpers/systemIcons';

import { Loader } from 'components';


import language from 'helpers/lang';
const lang = language.sidebar;

import UserMenu from './userMenu';

const SidebarOption = ({
  name,
  path,
  icon,
  onClick,
  iconSize,
  current,
  arrowEnabled,
}) => {
  if(!iconSize) iconSize = '50%';
  if(!path) path = '/' + name.toLowerCase();

  if(typeof path === 'object') {
    for (let p of path) {
      if(p === current) {
        path = p;
        break;
      }
    }
  }

  let myClassName =
    path === current
      ? `${styles.option} ${styles.current}`
      : `${styles.option}`;

  if(arrowEnabled === undefined) arrowEnabled = true;

  // <FontAwesomeIcon
  //   style={{ width: iconSize, height: iconSize }}
  //   className={styles.icon}
  //   icon={icon}
  // />


  return (
    <div onClick={onClick} className={myClassName} id='sidebar'>

    <div
      style={{ width: iconSize, height: iconSize }}
      className={styles.icon}
    >
      { icon !== null &&
        <>{icon}</>
      }
    </div>

      {arrowEnabled && (
        <div className={styles.select}>
          <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
          {name}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const router = useRouter();

  //think this one through
  let [current, setCurrent] = useState(router.pathname);
  //!!

  let [userMenuOpen, setUserMenuOpen] = useState(false);
  let [loaderActive, setLoaderActive] = useState(false);

  const navTo = href => {
    if(current === href) return;

    setLoaderActive(true);

    //is this necessary? !!
    setCurrent(href);
    //!!


    router.push(href);
  };


  // svg = React.createElement(svg)
  //arrowEnabled on userMenu must be dependent on UserMenu
  //component
  return (
    <>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <SidebarOption
          arrowEnabled={!userMenuOpen}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          iconSize={'50%'}
          name={lang.user}
          icon={Avatar}
        />
        <SidebarOption
          path={['/', '/home']}
          onClick={() => navTo('/')}
          current={current}
          name={lang.home}
          icon={Home}
          iconSize={'50%'}
        />
        <SidebarOption
          onClick={() => navTo('/courses')}
          current={current}
          name={lang.courses}
          icon={Book}
          iconSize={'50%'}
        />
        <SidebarOption
          current={current}
          iconSize={'50%'}
          name={lang.assignments}
          icon={Bookmark}
        />
        <SidebarOption
          onClick={() => navTo('/calendar')}
          current={current}
          iconSize={'50%'}
          name={lang.schedule}
          icon={Calendar}
        />
      </div>
      <UserMenu setUserMenuOpen={setUserMenuOpen} open={userMenuOpen} />
    </>
  );
};

// <SidebarOption
//   arrowEnabled={!userMenuOpen}
//   onClick={() => setUserMenuOpen(!userMenuOpen)}
//   iconSize={'40%'}
//   name={lang.user}
//   icon={faUser}
// />
// <SidebarOption
//   path={['/', '/home']}
//   onClick={() => navTo('/')}
//   current={current}
//   name={lang.home}
//   icon={faHome}
// />
// <SidebarOption
//   onClick={() => navTo('/courses')}
//   current={current}
//   name={lang.courses}
//   icon={faLandmark}
// />
// <SidebarOption
//   current={current}
//   iconSize={'40%'}
//   name={lang.assignments}
//   icon={faBook}
// />
// <SidebarOption
//   onClick={() => navTo('/calendar')}
//   current={current}
//   iconSize={'40%'}
//   name={lang.schedule}
//   icon={faCalendar}
// />

export default Sidebar;
