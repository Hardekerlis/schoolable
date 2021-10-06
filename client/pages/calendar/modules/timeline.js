import { nanoid } from 'nanoid';

import { DateTime, Interval } from 'luxon';

import generateOneDaySchedule from './oneDay.js';
import isHoliday from './holiday.js';

import { hourHeight } from './misc.js';

import styles from '../calendar.module.sass'

const generateTimelineDay = (events, index) => {

  let holiday = isHoliday(events[0].start.startOf('day'));

  let hourHeightUse = 100;

  let schedule = generateOneDaySchedule(events[0].start.startOf('day'), hourHeightUse, events, {
    timeline: true,
    extraClass: styles.timelineSchedule
  });

  let { eventRenderers, eventInfos } = schedule;

  let sumHeight = 0;

  let prevCollision = null;

  let marginTop = 10; //px
  let marginTopSkipped = 0;
  let marginTopApplied = 0;

  for(let i = 0; i < eventRenderers.length; i++) {

    let elem = eventRenderers[i];
    let info = eventInfos[i];

    elem.props.style.height = `${hourHeightUse}px`;

    let top = sumHeight;

    if(prevCollision !== null && info.collidedWith.indexOf(prevCollision) !== -1) {
      top -= sumHeight;
      marginTopSkipped++;
    }else {
      sumHeight += hourHeightUse;
      top += (marginTop * (i - marginTopSkipped));
      marginTopApplied++;
    }

    elem.props.style.top = `${top}px`;

    eventRenderers[i] = elem;

    if(info.collidedWith.length !== 0) {
      prevCollision = i;
    }

  }

  let containerTop = 30;

  //only for rendering
  if(index !== 0) sumHeight += containerTop;

  const isCurrentDay = (events[0].start.startOf('day').toISO() === DateTime.now().startOf('day').toISO());

  let dotClassName = (isCurrentDay) ? `${styles.dotContainer} ${styles.current}` : styles.dotContainer;

  if(!isCurrentDay) {

    if(DateTime.now().startOf('day').ts > events[0].start.startOf('day').ts) {

      dotClassName += ` ${styles.beforeToday}`;

    }

  }

  let dateClasses = (holiday) ? `${styles.date} ${styles.holiday}` : styles.date;

  let showcase = (
    <div className={styles.showcase}>
      <div style={{marginTop: `${containerTop}px`}} className={dotClassName}>
        <div className={styles.dot}></div>
      </div>
      <div className={dateClasses}>
        <p>{events[0].start.toFormat(`ccc`)}</p>
        <p>{events[0].start.toFormat(`LL`)}</p>
      </div>
    </div>
  )

  return (
    <div key={nanoid(6)} style={{height: `${sumHeight + (marginTopApplied * marginTop)}px`}} className={styles.timeline}>

      {showcase}

      <div style={{marginTop: `${containerTop}px`}} className={styles.timelineContainer}>
        <div className={styles.events}>

          {eventRenderers}

        </div>

      </div>
    </div>
  )

}

const timelineSchedule = (data, selectedDayObject) => {

  //master is a collection of all days with their
  //events as props
  let master = {};
  const firstDayDate = selectedDayObject;

  for(let evt of data) {
    let formatted = evt.start.toFormat('dd:MM:yyyy');

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

  // console.log(master)

  let dayRenders = [];

  for(let i = 0; i < 4; i++) {
    let day = master[Object.keys(master)[i]];

    // console.log(day)

    dayRenders.push(generateTimelineDay(day, i));


  }

  return(
    <div className={styles.timelineWrapper}>
      {dayRenders}
    </div>
  )

}

export default timelineSchedule;