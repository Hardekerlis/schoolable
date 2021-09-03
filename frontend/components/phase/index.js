import React, { useEffect, useState } from 'react';

import styles from './phase.module.sass';

const Phase = ({ name }) => {

  return(
    <div className={styles.wrapper}>
      <div className={styles.image}>
        <p className={styles.hoverText}>{name}</p>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.name}>{name}</p>
      </div>
    </div>
  )

}

export default Phase;
