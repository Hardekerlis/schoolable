import React, { useState, useEffect } from 'react';

import styles from './date.module.sass';

const Date = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Sun</div>
      <div className={styles.date_container}>
        <div className={styles.date}>
          <p>25</p>
        </div>
      </div>
    </div>
  );
};

export default Date;
