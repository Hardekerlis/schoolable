import { generateDayDividers, generateDayIdentifier, hourHeight } from './misc.js';

import generateOneDaySchedule from './oneDay.js';

import styles from '../calendar.module.sass';


//generate multiple days.
const multipleDaySchedule = (data, selectedDayObject) => {

  //used as a reference to find out which is the earliest
  //event
  let firstEvt = null;

  //master is a collection of all days with their
  //events as props
  let master = {};
  const firstDayDate = selectedDayObject;

  for(let evt of data) {
    let formatted = evt.start.toFormat('dd:MM:yyyy');

    //calculate the earliest event
    //by comparing all events with eachother
    let comp = (evt.start.get('hour') + (evt.start.get('minute') / 100));
    if(firstEvt === null || comp < firstEvt.comparer) {
      firstEvt = {
        comparer: comp,
        evt: evt
      }
    }

    //calculate a number (sum) which is used for
    //sorting the dates. e.g 24 sept will be after 23 sept
    let nums = formatted.split(':');
    let sum = 0;

    for(let t = 0; t < nums.length; t++) {
      let num = nums[t];
      //MIGHT HAVE TO BE TWEAKED
      sum += parseFloat(num) * (Math.pow(t+1, 5));
    }

    if(!master.hasOwnProperty(sum)) {
      master[sum] = [];
    }

    master[sum].push(evt);

  }

  let isSevenDay = false;

  if(Object.keys(master).length === 7) {
    isSevenDay = true;
  }

  let completeRenderPreparer = [];

  //actually generate the renders for the events
  for(let i = 0; i < Object.keys(master).length; i++) {

    const dayData = master[Object.keys(master)[i]];

    const dayDate = dayData[0].start.startOf('day');

    const day = generateOneDaySchedule(dayDate, hourHeight, dayData, {
      extraClass: styles.multipleDaySchedule,
      eventsClass: styles.multipleDayEvents,
      sevenDaySchedule: isSevenDay
    });

    // <p className={styles.dayDateText}>{dayDate.toLocaleString({ month: 'long', day: 'numeric' })}</p>

    completeRenderPreparer.push(
      <div key={i} className={(isSevenDay) ? styles.completeSevenEventDay : styles.completeThreeEventDay}>
        {generateDayIdentifier(dayDate)}
        {day.completeRender}
      </div>
    )

  }

  //generate the vertical lines that divide the days
  let divider = generateDayDividers(Object.keys(master).length);

  return {
    jsx: (
      <div className={styles.multipleDayExtraPositioning}>
        {completeRenderPreparer}
        {divider}
      </div>
    ),
    firstEvent: firstEvt.evt
  }
}

const oneDaySchedule = (data) => {
  const oneDay = generateOneDaySchedule(data[0].start.startOf('day'), hourHeight, data, {
    extraClass: styles.oneDaySchedule,
  });

  return {
    jsx: (
      <div className={styles.oneDayContainer}>
        <div className={styles.oneDayTitle}>{generateDayIdentifier(data[0].start.startOf('day'))}</div>
        {oneDay.completeRender}
      </div>
    ),
    firstEvent: oneDay.sorted[0]
  }
}


export {
  multipleDaySchedule,
  oneDaySchedule
}
