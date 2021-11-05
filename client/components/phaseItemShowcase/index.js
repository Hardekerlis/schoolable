import React, { useEffect, useState } from 'react';

import language from 'helpers/lang';
const lang = language.phaseItemShowcase;

import {
  firstLetterToUpperCase
} from 'helpers';

import styles from './phaseItemShowcase.module.sass';

const PhaseItemShowcase = ({ isEditing, name, description, list, onClick, selected }) => {

  let className = (list) ? `${styles.listWrapper} ${styles.wrapper}` : styles.wrapper;
  if(selected) className += ` ${styles.selected}`;

  return(
    <div onClick={onClick} className={className}>
      <p className={styles.title}>{firstLetterToUpperCase(name)}</p>
      { !list &&
        <>
          <div className={styles.hozLine}></div>
          <p className={styles.desc}>{description}</p>
        </>
      }
      { isEditing &&
        <div className={styles.editText}>
          <p>{lang.editText}</p>
        </div>
      }
    </div>
  )

}

export default PhaseItemShowcase;
