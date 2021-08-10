import React, { useState, useEffect } from 'react';

import { faHistory, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './nextEvent.module.sass'

const NextEvent = () => {

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Svenska</p>
      <div className={styles.hoz_line}></div>
      <div className={styles.container}>
        <FontAwesomeIcon className={styles.icon} icon={faHistory} />
        <p>0:40</p>
        <FontAwesomeIcon className={styles.icon} icon={faMapMarkerAlt} />
        <p>TBA</p>
      </div>
    </div>
  )

}

export default NextEvent;
