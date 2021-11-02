import React, { useEffect, useState } from 'react';

import styles from './phaseItemShowcase.module.sass';

const PhaseItemShowcase = ({ name, description, list, onClick, selected }) => {

  let className = (list) ? `${styles.listWrapper} ${styles.wrapper}` : styles.wrapper;
  if(selected) className += ` ${styles.selected}`;

  return(
    <div onClick={onClick} className={className}>
      <p className={styles.title}>{name}</p>
      { !list &&
        <>
          <div className={styles.hozLine}></div>
          <p className={styles.desc}>{description}</p>
        </>
      }
    </div>
  )

}

export default PhaseItemShowcase;
