import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/router';

import getUserData from 'helpers/getUserData.js'

import Request from 'helpers/request.js'

import language from 'helpers/lang';
const lang = language.sidebar;

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

const UserMenu = ({ open, setUserMenuOpen }) => {

  const router = useRouter();

  const userData = getUserData();

  let menuElem = React.useRef();

  useEffect(() => {

    if(open) {
      menuElem.current.classList?.add(`${styles.open}`);
    }else {
      menuElem.current.classList?.remove(`${styles.open}`);
    }

  }, [open])

  const bodyClickListener = (evt) => {

    let isOpen = menuElem.current?.classList.contains(`${styles.open}`);

    if(!isOpen) return;

    //TODO: probably more cross browser compatibility
    let evtPath = evt.path || evt.composedPath();

    let match = false;

    //check if the user click on something that has nothing to do with the userMenu
    for(let target of evtPath) {
      if(target.classList?.contains(`${styles.userMenu}`)) match = true;
    }

    if(!match) {
      setUserMenuOpen(false)
    }

  }

  useEffect(() => {

    //add click event listener to check if the user clicks outside the userMenu

    document.body.addEventListener('click', bodyClickListener);

  }, [])

  const logout = async() => {

    let req = new Request('/api/auth/logout').get().json();
    let res = await req.send();

    router.push('/login');

  }

  return (
    <div ref={menuElem} className={styles.userMenu}>
      <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
      <UserMenuOption title={`${lang.hiya} ${userData.name?.first} ${userData.name?.last}`} />
      <UserMenuOption onClick={logout} title={lang.logout} clickable={true} />
    </div>
  )

}

export default UserMenu;
