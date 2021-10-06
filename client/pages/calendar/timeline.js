import { nanoid } from 'nanoid';

import { DateTime, Interval } from 'luxon';

import generateOneDaySchedule from './oneDay.js';
import isHoliday from './holiday.js';

import styles from './calendar.module.sass'

const generateTimelineDay = (events, hourHeight, index) => {

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

export default generateTimelineDay;