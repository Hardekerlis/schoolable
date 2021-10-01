import { nanoid } from 'nanoid';

import { DateTime, Interval } from 'luxon';

import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import styles from './calendar.module.sass'

const generateOneDaySchedule = (day, hourHeight, data, options) => {

  if(options.ghostLeft === undefined || options.ghostLeft === null) options.ghostLeft = 0;

  console.log("Generating day:", day.setLocale('en-US').toLocaleString({
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }))

  //sort every event. So the one that starts earliest
  //is on top.

  const sorted = data.sort((d1, d2) => {
    return d1.start.toSeconds() - d2.start.toSeconds()
  })

  //create the necessary information for each event
  //this will be used for event- positioning and sizing
  //this also check for any event overlapping

  const eventInfos = [];

  for(let j = 0; j < sorted.length; j++) {
    const obj = sorted[j];

    //handling timestamp
    const diff = obj.end.toSeconds() - obj.start.toSeconds();

    const lessonInterval = Interval.fromDateTimes(obj.start, obj.end);
    const timeInterval = Interval.fromDateTimes(day, obj.start);

    const hours = lessonInterval.length('hour');

    //generating size and position
    const height = hours * hourHeight;
    const top = timeInterval.length('hour') * hourHeight;

    //these are used for calculating overlapping
    //some are hardcoded because it's only one day
    //e.g the with doesn't matter for overlapping detection
    //because every event has the same with to start with
    const width = 100;
    const left = 0;
    const right = width + left;
    const bottom = top + height;

    let collidedWith = [];

    //checking overlapping
    for(let key in eventInfos) {
      const checkInfo = eventInfos[key];

      if(bottom <= checkInfo.top || top >= checkInfo.bottom || right <= checkInfo.left || left >= checkInfo.right) {
        //no collision
      }else {
        //collision
        collidedWith.push(checkInfo.index)
        eventInfos[checkInfo.index].collidedWith.push(j)
      }

    }

    eventInfos.push({
      height,
      width,
      top,
      bottom,
      left,
      right,
      index: j,
      collidedWith
    })

  }

  //create the actual event elements
  //to be used for rendering

  const eventRenderers = sorted.map((obj, index) => {

    const info = eventInfos[index];

    let width = 100;
    let left = 0;

    let enableLocation = true;
    let titleWidth = 60;
    let timeTextTop = 10;

    //resizing if overlapping
    if(info.collidedWith.length !== 0) {

      enableLocation = false;

      let cols = info.collidedWith;
      cols.push(index);
      cols.sort();

      width = width / cols.length;
      left = cols.indexOf(index) * width;

      titleWidth = 100;
      timeTextTop = 35;

    }

    left = `${left}%`;
    width = `${width}%`;
    titleWidth = `${titleWidth}%`;
    timeTextTop = `${timeTextTop}px`


    const className = (options.extraClass) ? `${styles.ghostEventContainer} ${options.extraClass}` : styles.ghostEventContainer;

    const ghostStyle = {
      top: `${info.top}px`,
      height: `${info.height}px`
    }

    if(options.ghostLeft) ghostStyle.left = `${options.ghostLeft}px`;
    if(options.eventWidth) ghostStyle.width = `${options.eventWidth}px`;

    return (
      <div style={ghostStyle} className={className} key={index + nanoid(6)}>
        <div data-index={index} style={{width: width, left: left}} className={styles.event}>
          <p style={{width: titleWidth}} className={styles.eventName}>{obj.title}</p>

          { enableLocation &&
            <div className={styles.locationWrapper}>
              <FontAwesomeIcon className={styles.mapIcon} icon={faMapMarkerAlt} />
              <p>{obj.location}</p>
            </div>
          }

          <p style={{top: timeTextTop}} className={styles.time}>{`${obj.start.toFormat('HH:mm')} - ${obj.end.toFormat('HH:mm')}`}</p>

        </div>
      </div>
    )

  })

  //return all useful information
  return {
    eventRenderers,
    sorted,
    eventInfos
  }

}

export default generateOneDaySchedule;