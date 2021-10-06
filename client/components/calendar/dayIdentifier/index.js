import React, { useEffect, useState } from 'react';

import isHoliday from '../holiday.js';

import styles from './dayIdentifier.module.sass';

const DayIdentifier = ({ date }) => {

  let className = (isHoliday(date)) ? `${styles.dayIdentifier} ${styles.holiday}` : styles.dayIdentifier;

  return (
    <div className={className}>
      <p>{date.toFormat('cccc')}</p>
      <p>{date.toLocaleString({ month: 'long', day: 'numeric' })}</p>
    </div>
  )

}

export default DayIdentifier;
