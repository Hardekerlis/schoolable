import React, { useEffect, useState } from 'react';

import { hourHeight } from '../misc.js'

import styles from './dayDividers.module.sass';

//generate the vertical lines that divide the days
const DayDividers = ({ amount }) => {

  let dividers = [];
  let initialNum = 0.5;
  let scalingNum = 2.5;

  if(amount === 7) {
    initialNum = 0.35;
    scalingNum = 0.85;
  }

  let left = Math.floor(100 / amount) - initialNum;

  for(let i = 0; i < amount-1; i++) {

    dividers.push (
      <div key={i} style={{left: `${(left * (i+1)) + (scalingNum * i)}%`, height: `${hourHeight * 24}px`}} className={styles.dayDivider}></div>
    )
  }


  return dividers;


}

export default DayDividers;
