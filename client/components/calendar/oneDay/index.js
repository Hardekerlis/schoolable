import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';


import { nanoid } from 'nanoid';


import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import { DateTime, Interval } from 'luxon';

import { hourHeight as HourHeight } from '../misc.js';

import { DayDividers, DayIdentifier } from 'components/calendar';


import styles from './oneDay.module.sass';

const _OneDayExtra = (day, data, options) => {

  const hourHeight = (options.hourHeight) ? options.hourHeight : HourHeight;

  data = data.concat([])

  if(!options) options = {};

  if(options.ghostLeft === undefined || options.ghostLeft === null) options.ghostLeft = 0;

  // console.log("Generating day:", day.setLocale('en-US').toLocaleString({
  //   month: 'long',
  //   day: 'numeric',
  //   year: 'numeric'
  // }))

  let fullDayEvents = [];

  for(let o = 0; o < data.length; o++) {

    if(data[o].fullDay) {
      fullDayEvents.push({evt: data[o], index: o});
    }

  }

  let _offset = 0;
  fullDayEvents = fullDayEvents.map(obj => {

    data.splice(obj.index + _offset, 1);
    _offset++;

    return (obj.evt);

  })

  //sort every event. So the one that starts earliest
  //is on top.
  const sorted = data.sort((d1, d2) => {
    return d1.start.toSeconds() - d2.start.toSeconds()
  })

  //create the necessary information for each event
  //this will be used for event- positioning and sizing
  //this also check for any event overlapping

  const eventInfos = [];
  let heightOfAllPrevEvents = 0;

  for(let j = 0; j < sorted.length; j++) {
    const obj = sorted[j];

    //handling timestamp
    const diff = obj.end.toSeconds() - obj.start.toSeconds();

    const lessonInterval = Interval.fromDateTimes(obj.start, obj.end);
    const timeInterval = Interval.fromDateTimes(day, obj.start);

    const hours = lessonInterval.length('hour');

    //skip luxon for this step
    //the lesson start times does not need to factor
    //in DST for calculation.
    // const topHours = timeInterval.length('hour');
    const topHours = day.toObject().hour + obj.start.toObject().hour + ((day.toObject().minute + obj.start.toObject().minute) / 60);

    //generating size and position
    const height = hours * hourHeight;
    let top = (topHours * hourHeight);


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

    top -= heightOfAllPrevEvents;

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

    heightOfAllPrevEvents += height;


  }

  //create the actual event elements
  //to be used for rendering

  let eventRenderers = sorted.map((obj, index) => {

    const info = eventInfos[index];

    let width = 100;
    let left = 0;

    let enableLocation = true;
    let titleWidth = 60;
    // let timeTextTop = 10;

    let timeTextClass = styles.time;

    //resizing if overlapping
    if(info?.collidedWith.length !== 0) {

      enableLocation = false;

      let cols = info.collidedWith;
      cols.push(index);
      cols.sort();

      width = width / cols.length;
      left = cols.indexOf(index) * width;

      titleWidth = 100;
      // timeTextTop = 35;

      timeTextClass = `${styles.time} ${styles.timeSmall}`

    }

    left = `${left}%`;
    width = `${width}%`;
    titleWidth = `${titleWidth}%`;

    let eventNameStyle = {
      width: titleWidth,
    }

    if(options.sevenDaySchedule === true) {

      if(info.height < 90) {
        //remove location
        enableLocation = false;
      }

      eventNameStyle.width = '100%';

    }

    let className = (options.extraClass) ? `${styles.ghostEventContainer} ${options.extraClass}` : styles.ghostEventContainer;

    const ghostStyle = {
      top: `${info?.top}px`,
      height: `${info?.height}px`
    }

    if(options.ghostLeft) ghostStyle.left = `${options.ghostLeft}px`;
    if(options.eventWidth) ghostStyle.width = `${options.eventWidth}px`;

    const eventStyle = {
      width: width,
      left: left
    }

    if(obj.color) eventStyle.backgroundColor = obj.color;

    return (
      <div style={ghostStyle} className={className} key={index + nanoid(6)}>
        <div data-index={index} style={eventStyle} className={styles.event}>
          <p style={eventNameStyle} className={styles.eventName}>{obj.title}</p>

          { options.sevenDaySchedule ?
              <>

                <p style={{position: 'relative', top: 'unset', left: 'unset', marginLeft: '10px'}} className={timeTextClass}>{`${obj.start.toFormat('HH:mm')} - ${obj.end.toFormat('HH:mm')}`}</p>

                { enableLocation &&
                  <div className={styles.locationWrapper}>
                    <FontAwesomeIcon className={styles.mapIcon} icon={faMapMarkerAlt} />
                    <p>{obj.location}</p>
                  </div>
                }

              </>

            :

            <>

              { enableLocation &&
                <div className={styles.locationWrapper}>
                  <FontAwesomeIcon className={styles.mapIcon} icon={faMapMarkerAlt} />
                  <p>{obj.location}</p>
                </div>
              }

              <p className={timeTextClass}>{`${obj.start.toFormat('HH:mm')} - ${obj.end.toFormat('HH:mm')}`}</p>

            </>

          }


        </div>
      </div>
    )

  })

  let fullDayEventsWidth = 100 / fullDayEvents.length;
  let fullDayEventRenderers = [];

  //generate full day events
  for(let i = 0; i < fullDayEvents.length; i++) {

    const evt = fullDayEvents[i];

    const evtStyle = {
      width: `${fullDayEventsWidth}%`
    };

    if(evt.color) evtStyle.backgroundColor = evt.color;

    fullDayEventRenderers.push(
      <div key={i} style={evtStyle} className={styles.fullDayEvent}>
        <p>{evt.title}</p>
      </div>
    )

  }

  let fullDayEventContainer = (
    <div key={"fullDayEventContainer"} className={(options.fullDayClass) ? `${styles.fullDayContainer} ${options.fullDayClass}` : styles.fullDayContainer}>
      {fullDayEventRenderers}
    </div>
  )


  eventRenderers = eventRenderers.concat([fullDayEventContainer])


  const evtsClass = (options.eventsClass) ? `${styles.events} ${options.eventsClass}` : styles.events;

  return {
    jsx: (
      <div style={{minHeight: `${(hourHeight * 24)}px`}} className={evtsClass}>
        {eventRenderers}
      </div>
    ),
    eventRenderers,
    eventInfos
  }

}

const _OneDay = ({ day, data, options }) => {
  return _OneDayExtra(day, data, options).jsx;
}

//TODO: Investigate SSR
const OneDay = dynamic(() => Promise.resolve(_OneDay), {
  ssr: false
})

const OneDayExtra = _OneDayExtra;

export {
  OneDay,
  OneDayExtra
}
