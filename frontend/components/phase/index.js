import React, { useEffect, useState } from 'react';


import { faFileAlt, faAngleRight, faPenSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './phase.module.sass';

const Phase = ({ name, editing }) => {

  if(editing) {

    //Editable phase

    return (
      <div className={styles.phaseEdit}>
        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faPenSquare} className={`${styles.fileIcon} ${styles.icon}`} />
        </div>
        <p className={styles.name}>{name}</p>
        <div className={styles.editBtn}>
          <p>Edit</p>
        </div>
      </div>
    )

  }else {

    //Non-editable phase

    return (
      <div className={styles.wrapper}>
        <div className={styles.textContainer}>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={faFileAlt} className={`${styles.fileIcon} ${styles.icon}`} />
          </div>
          <p className={styles.name}>{name}</p>
        </div>

      </div>
    )

  }

}

// <div className={styles.iconContainer}>
//   <FontAwesomeIcon icon={faFileAlt} className={`${styles.fileIcon} ${styles.icon}`} />
// </div>

// <div className={styles.arrowContainer}>
//   <FontAwesomeIcon icon={faAngleRight} className={styles.arrow} />
// </div>

export default Phase;
