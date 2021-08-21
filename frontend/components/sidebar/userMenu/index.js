import React, { useState, useEffect } from 'react';

import styles from './userMenu.module.sass';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faCaretLeft } from '@fortawesome/free-solid-svg-icons'

const UserMenuOption = ({ title, clickable, onClick }) => {

  let className = `${styles.option}`;

  if(clickable) className += ` ${styles.clickable}`

  return(
    <div onClick={onClick} className={className}>
      <p className={styles.title}>{title}</p>

    </div>
  )

}

const UserMenu = ({ open }) => {

  let menuElem = React.useRef();

  useEffect(() => {

    if(open) {
      menuElem.current.classList?.add(`${styles.open}`);
    }else {
      menuElem.current.classList?.remove(`${styles.open}`);
    }

  }, [open])

  const logout = () => {

    

  }

  return (
    <div ref={menuElem} className={styles.userMenu}>
      <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
      <UserMenuOption title={"My Username"} />
      <UserMenuOption onClick={logout} title={"Logout"} clickable={true} />

    </div>
  )

}

export default UserMenu;
