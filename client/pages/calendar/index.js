//lib imports

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { DateTime } from 'luxon';


//custom imports



import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar } from 'components'

import lang from 'helpers/lang';



import generateOneDaySchedule from './oneDay.js';

//css imports

import styles from './calendar.module.sass';

const Calendar = () => {

  let [scheduleType, setScheduleType] = useState('oneDay');

  const today = DateTime.now().startOf('day');

  const selectedDayObject = {
    year: 2021,
    month: 9,
    day: 22
  }

  const selectedDay = DateTime.fromObject(selectedDayObject)

  const selDayData = [
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
      title: 'Svenska hejhejhej 2',
      start: selectedDay.set({hour: 11, minute: 30}),
      end: selectedDay.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
    // {
    //   title: 'Coole',
    //   start: selectedDay.set({hour: 11, minute: 10}),
    //   end: selectedDay.set({hour: 11, minute: 40}),
    //   location: 'coole'
    // },
    // {
    //   title: 'Coole 2',
    //   start: selectedDay.set({hour: 11, minute: 20}),
    //   end: selectedDay.set({hour: 11, minute: 50}),
    //   location: 'coole 2'
    // },
    // {
    //   title: 'Coole 2.5',
    //   start: selectedDay.set({hour: 11, minute: 20}),
    //   end: selectedDay.set({hour: 11, minute: 50}),
    //   location: 'coole 2.5'
    // },
    // {
    //   title: 'Coole 2.5.5',
    //   start: selectedDay.set({hour: 11, minute: 20}),
    //   end: selectedDay.set({hour: 11, minute: 50}),
    //   location: 'coole 2.5.5'
    // },
    // {
    //   title: 'Coole 2.5.5.5',
    //   start: selectedDay.set({hour: 11, minute: 20}),
    //   end: selectedDay.set({hour: 11, minute: 50}),
    //   location: 'coole 2.5.5.5'
    // },
    // {
    //   title: 'Coole 2.5.5',
    //   start: selectedDay.set({hour: 11, minute: 20}),
    //   end: selectedDay.set({hour: 11, minute: 50}),
    //   location: 'coole 2.5.5'
    // },
  ]

  const selSecond = selectedDay.plus({day: 1});
  const selSecondDay = [
    {
      title: 'Svenska',
      start: selSecond.set({hour: 12}),
      end: selSecond.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selSecond.set({hour: 13, minute: 30}),
      end: selSecond.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selSecond.set({hour: 11, minute: 30}),
      end: selSecond.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
  ]

  const selThird = selSecond.plus({day: 1});
  const selThirdDay = [
    {
      title: 'Svenska',
      start: selThird.set({hour: 12}),
      end: selThird.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selThird.set({hour: 13, minute: 30}),
      end: selThird.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selThird.set({hour: 11, minute: 30}),
      end: selThird.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
    // {
    //   title: 'Svenska hejhejhej 3',
    //   start: selThird.set({hour: 7, minute: 30}),
    //   end: selThird.set({hour: 10, minute: 55}),
    //   location: 'rummet'
    // },
    {
      title: 'Svenska hejhejhej 3',
      start: selThird.set({hour: 11, minute: 30}),
      end: selThird.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ]

  //how many px is one hour
  const hourHeight = 160;

  let eventRenderers = [];
  let sorted = [];

  const oneDaySchedule = (data) => {
    const oneDay = generateOneDaySchedule(selectedDay, hourHeight, data, {
      extraClass: styles.oneDaySchedule
    });
    eventRenderers = oneDay.eventRenderers;
    sorted = oneDay.sorted;
  }

  // oneDaySchedule(selDayData);

  // console.log(selDayData, selSecondDay)

  //REBUILD TO RELATIVE POSITIONS INSTEAD.
  //FUCK MEEEEEEEEEE
  //WARNING WILL TAKE 50min AT LEAST

  const threeDaySchedule = (data, marginLeft, evtWidth, daySpacing) => {

    let firstEvt = null;

    let master = {};
    const firstDayDate = selectedDayObject;

    for(let evt of data) {
      let formatted = evt.start.toFormat('dd:MM:yyyy');


      let comp = (evt.start.get('hour') + (evt.start.get('minute') / 100));
      if(firstEvt === null || comp < firstEvt.comparer) {
        firstEvt = {
          comparer: comp,
          evt: evt
        }
      }

      let nums = formatted.split(':');
      let sum = 0;

      for(let num of nums) {
        sum += parseFloat(num);
      }

      if(!master.hasOwnProperty(sum)) {
        master[sum] = [];
      }

      master[sum].push(evt);

    }


    for(let i = 0; i < 3; i++) {

      const dayData = master[Object.keys(master)[i]];

      const dayDate = dayData[0].start.startOf('day');

      const day = generateOneDaySchedule(dayDate, hourHeight, dayData, {
        eventWidth: evtWidth,
        ghostLeft: (evtWidth * i) + (daySpacing * i) + marginLeft,
      });

      eventRenderers = eventRenderers.concat(day.eventRenderers)

    }

    sorted = [firstEvt.evt];

  }

  const threeDayData = selDayData.concat(selSecondDay).concat(selThirdDay);
  threeDaySchedule(threeDayData, 180, 250, 36)

  //scroll the calendar to the earliest event.
  const setCalendarElem = (elem) => {
    if(!elem) return;
    // elem.scrollTop = 11 * hourHeight
    elem.scrollTop = sorted[0].start.hour * hourHeight;
  }

  //generating segment.
  //i.e the lines that indicate time.
  const segmentRenderers = [];

  for(let i = 0; i < 24; i++) {

    segmentRenderers.push(
      <div style={{top: (hourHeight * i) + "px"}} key={i} className={styles.segment}>
        <div className={styles.line}></div>
        <p className={styles.hour}>{`${i}:00`}</p>
      </div>
    )

  }

  return (
    <Layout mainClass={styles.headWrapper}>

      <div className={styles.wrapper}>

        <Sidebar />

        <div className={styles.calendarWrapper}>
          <p className={styles.pageTitle}>Calendar</p>

          <div ref={setCalendarElem} className={styles.calendar}>
            {eventRenderers}
            {segmentRenderers}
          </div>

        </div>


      </div>

    </Layout>
  )

}

export default Calendar;































//
