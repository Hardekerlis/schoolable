import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import {
  faFileAlt,
  faAngleRight,
  faPenSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  IconRenderer,
  LightEdit,
  Document
} from 'helpers/systemIcons';

import styles from './module.module.sass';

const ModuleToolbarOption = ({ text, onClick, icon }) => {

  return (
    <div onClick={onClick} className={styles.option}>
      <IconRenderer className={styles.icon} icon={icon} />
      <p>{text}</p>
    </div>
  )

}

const Module = ({
  index,
  name,
  editing,
  id,
  setModuleEditMenuOpen,
  className,
  clickable,
  setLoaderActive
}) => {
  const router = useRouter();

  if(clickable !== false) clickable = true;

  const nonEditableClick = () => {
    if(!clickable) return;

    setLoaderActive(true)

    console.log("no phase page exists")

    // router.push(`/courses/page/phases?id=${router.query.id}&phase=${id}`);
  };

  const editableClick = () => {
    //open edit menu

    // console.log("clicked an editable phase")

    setModuleEditMenuOpen(index, name, id);
  };

  const goToModuleEdit = () => {
    //TODO: go to phase edit page
    setLoaderActive(true);

    console.log("no phase page exists")

    // router.push(`/courses/page/phases/edit?id=${router.query.id}&phase=${id}`);
  }

  const goToModulePage = () => {
    setLoaderActive(true)
    console.log('no phase page exists');
    // router.push(`/courses/page/phases?id=${router.query.id}&phase=${id}`);
  }

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(!clickable) {
    containerClassName += ` ${styles.nonClickable}`;
  }

  if(editing) {
    //Editable module

    return (
      <div className={styles.moduleEditWrapper}>

        <div onClick={editableClick} className={styles.moduleEdit}>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon
              icon={faPenSquare}
              className={`${styles.fileIcon} ${styles.icon}`}
            />
          </div>
          <p className={styles.name}>{name}</p>
          <div className={styles.editBtn}>
            <p>Edit</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <ModuleToolbarOption text={"Edit module page"} icon={LightEdit} onClick={goToModuleEdit} />
          <ModuleToolbarOption text={"Go to module page"} icon={Document} onClick={goToModulePage} />
        </div>

      </div>
    );
  }else {
    //Non-editable module

    return (
      <div onClick={nonEditableClick} className={containerClassName}>
        <div className={styles.textContainer}>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon
              icon={faFileAlt}
              className={`${styles.fileIcon} ${styles.icon}`}
            />
          </div>
          <p className={styles.name}>{name}</p>
        </div>
      </div>
    );
  }
};


export default Module;
