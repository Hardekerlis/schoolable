import isHoliday from './holiday.js';

import styles from '../calendar.module.sass';

//how many px is one hour
const hourHeight = 160;


const generateDayDividers = (days, dateDays) => {

  let dividers = [];
  let initialNum = 0.5;
  let scalingNum = 2.5;

  if(days === 7) {
    initialNum = 0.35;
    scalingNum = 0.85;
  }

  let left = Math.floor(100 / days) - initialNum;

  for(let i = 0; i < days-1; i++) {

    dividers.push (
      <div key={i} style={{left: `${(left * (i+1)) + (scalingNum * i)}%`, height: `${hourHeight * 24}px`}} className={styles.dayDivider}></div>
    )
  }


  return dividers;

}

const generateDayIdentifier = (date) => {

  let className = (isHoliday(date)) ? `${styles.dayIdentifier} ${styles.holiday}` : styles.dayIdentifier;

  return (
    <div className={className}>
      <p>{date.toFormat('cccc')}</p>
      <p>{date.toLocaleString({ month: 'long', day: 'numeric' })}</p>
    </div>
  )
}

export {
  generateDayDividers,
  generateDayIdentifier,
  hourHeight
}
