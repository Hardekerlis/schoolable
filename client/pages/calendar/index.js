//lib imports

import React, { useState, useEffect } from 'react';


import { useRouter } from 'next/router';

import { DateTime, Interval } from 'luxon';

//custom imports

import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar } from 'components'

import lang from 'helpers/lang';

//css imports

import styles from './calendar.module.sass';


const Calendar = () => {

  const today = DateTime.now().startOf('day');

  const selectedDay = DateTime.fromObject({
    year: 2021,
    month: 9,
    day: 22
  })

  const data = [
    {
      title: 'Svenska',
      start: selectedDay.set({hour: 12}),
      end: selectedDay.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selectedDay.set({hour: 13, minute: 30}),
      end: selectedDay.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska 2',
      start: selectedDay.set({hour: 11, minute: 30}),
      end: selectedDay.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ]

  const sorted = data.sort((d1, d2) => {
    return d1.start.toSeconds() - d2.start.toSeconds()
  })

  console.log("Showing day:", selectedDay.setLocale('en-US').toLocaleString({
    month: 'long',
    day: 'numeric'
  }))

  const hourHeight = 160;

  const setCalendarElem = (elem) => {
    if(!elem) return;
    elem.scrollTop = sorted[0].start.hour * hourHeight;
  }

  const eventRenderers = sorted.map((obj, index) => {

    const diff = obj.end.toSeconds() - obj.start.toSeconds();

    const lessonInterval = Interval.fromDateTimes(obj.start, obj.end);
    const timeInterval = Interval.fromDateTimes(selectedDay, obj.start);

    const hours = lessonInterval.length('hour');

    let height = hours * hourHeight;
    let top = timeInterval.length('hour') * hourHeight;

    return (
      <div data-index={index} style={{top: top + "px", height: height + "px"}} key={index} className={styles.event}>
        <p className={styles.eventName}>{obj.title}</p>
        <p className={styles.time}>{`${obj.start.toFormat('HH:mm')} - ${obj.end.toFormat('HH:mm')}`}</p>

        <div className={styles.locationWrapper}>
          <FontAwesomeIcon className={styles.mapIcon} icon={faMapMarkerAlt} />
          <p>{obj.location}</p>
        </div>

      </div>
    )

  })

  const renderers = [];

  for(let i = 0; i < 24; i++) {

    renderers.push(
      <div style={{top: (hourHeight * i) + "px"}} key={i} className={styles.segment}>
        <div className={styles.line}></div>
        <p className={styles.hour}>{`${i}:00`}</p>
      </div>
    )

  }

  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />

        <div className={styles.calendarWrapper}>
          <p className={styles.pageTitle}>Calendar</p>

          <div ref={setCalendarElem} className={styles.calendar}>
            {eventRenderers}
            {renderers}
          </div>

        </div>


      </div>

    </Layout>
  )

}

export default Calendar;































//
