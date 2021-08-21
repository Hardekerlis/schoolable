import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/router';

import getUserData from 'helpers/getUserData.js'

import Request from 'helpers/request.js'

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

const UserMenu = ({ open, setUserMenu }) => {

  const router = useRouter();

  const userData = getUserData();

  let menuElem = React.useRef();

  let [closeMenu, setCloseMenu] = useState();

  useEffect(() => {

    if(!closeMenu) {
      menuElem.current.classList?.add(`${styles.open}`);
    }else {
      menuElem.current.classList?.remove(`${styles.open}`);
    }

    setUserMenu(!closeMenu);

  }, [closeMenu])

  useEffect(() => {

    console.log("open changed", open)

    if(closeMenu !== open) {
      setCloseMenu(!open)
    }



  }, [open])

  const bodyClickListener = (evt) => {

    let isOpen = menuElem.current.classList.contains(`${styles.open}`);

    if(!isOpen) return;

    let evtPath = evt.path || evt.composedPath();

    let match = false;

    //check if the user click on something that has nothing to do with the userMenu
    for(let target of evtPath) {
      // console.log(target.classList)
      if(target.classList?.contains(`${styles.userMenu}`)) match = true;
    }

    if(!match) {
      setCloseMenu(false)
    }

  }

  useEffect(() => {

    //add click event listener to check if the user clicks outside the userMenu

    document.body.addEventListener('click', bodyClickListener);

  }, [])

  const logout = async() => {

    let req = new Request('/api/logout').get();
    let res = await req.send();

    router.push('/login');

  }

  return (
    <div ref={menuElem} className={styles.userMenu}>
      <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
      <UserMenuOption title={`Hiya! ${userData.name}`} />
      <UserMenuOption onClick={logout} title={"Logout"} clickable={true} />
    </div>
  )

}

export default UserMenu;
