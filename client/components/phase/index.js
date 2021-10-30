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

import styles from './phase.module.sass';

const PhaseToolbarOption = ({ text, onClick, icon }) => {

  return (
    <div onClick={onClick} className={styles.option}>
      <IconRenderer className={styles.icon} icon={icon} />
      <p>{text}</p>
    </div>
  )

}

const Phase = ({
  index,
  name,
  editing,
  id,
  setPhaseEditMenuOpen,
  className,
  clickable,
  setLoaderActive
}) => {
  const router = useRouter();

  if(clickable !== false) clickable = true;

  const nonEditableClick = () => {
    if(!clickable) return;

    setLoaderActive(true)

    router.push(`/courses/page/phases?id=${router.query.id}&phase=${id}`);
  };

  const editableClick = () => {
    //open edit menu

    // console.log("clicked an editable phase")

    setPhaseEditMenuOpen(index, name, id);
  };

  const goToPhaseEdit = () => {
    //TODO: go to phase edit page
    // router.push()
  }

  const goToPhasePage = () => {
    setLoaderActive(true)
    router.push(`/courses/page/phases?id=${router.query.id}&phase=${id}`);
  }

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(!clickable) {
    containerClassName += ` ${styles.nonClickable}`;
  }

  if(editing) {
    //Editable phase

    return (
      <div className={styles.phaseEditWrapper}>

        <div onClick={editableClick} className={styles.phaseEdit}>
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
          <PhaseToolbarOption text={"Edit phase page"} icon={LightEdit} onClick={goToPhaseEdit} />
          <PhaseToolbarOption text={"Go to phase page"} icon={Document} onClick={goToPhasePage} />
        </div>

      </div>
    );
  }else {
    //Non-editable phase

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

// <div className={styles.iconContainer}>
//   <FontAwesomeIcon icon={faFileAlt} className={`${styles.fileIcon} ${styles.icon}`} />
// </div>

// <div className={styles.arrowContainer}>
//   <FontAwesomeIcon icon={faAngleRight} className={styles.arrow} />
// </div>

export default Phase;
