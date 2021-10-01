//lib imports

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { DateTime } from 'luxon';


import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

  let calendarElem = React.useRef();

  let [scheduleType, setScheduleType] = useState('sevenDay');
  let [currentDay, setCurrentDay] = useState(DateTime.now().startOf('day').set({day: 31, month: 10}));
  let [completeRender, setCompleteRender] = useState();

  let navigated = false;

  //how many px is one hour
  const hourHeight = 160;

  let eventRenderers = [];
  let sorted = [];
  // let completeRender;

  const generateSchedule = () => {

     if(scheduleType === 'sevenDay')  {
       //find the corresponding sunday with todays date
        let day = DateTime.now().startOf('day');

        let weekday = parseFloat(day.toFormat('c'));

        if(weekday != 7) {
          day = day.minus({ day: weekday });
        }

     }

     const getCurrentDay = () => {
       let day = currentDay;

       if(scheduleType === 'sevenDay')  {
          //find the corresponding sunday with todays date

          let weekday = parseFloat(day.toFormat('c'));

          if(weekday != 7) {
            day = day.minus({ day: weekday }).startOf('day');
          }

       }

       return day;
     }


    const today = getCurrentDay();

    const selectedDayObject = today.toObject();

    const selectedDay = DateTime.fromObject(selectedDayObject)

    const selDayData = [
      {
        title: 'Svenska 10',
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
      {
        title: 'Svenska 1 2',
        start: selectedDay.set({hour: 11, minute: 30}),
        end: selectedDay.set({hour: 11, minute: 55}),
        location: 'rummet'
      },
      {
        title: 'Svenska hejhejhej 2',
        start: selectedDay.set({hour: 11, minute: 30}),
        end: selectedDay.set({hour: 11, minute: 55}),
        location: 'rummet'
      },
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

    const selFourth = selThird.plus({day: 1});
    const selFourthDay = [
      {
        title: 'Svenska',
        start: selFourth.set({hour: 12}),
        end: selFourth.set({hour: 13}),
        location: 'PBA'
      },
      {
        title: 'Svenska 2',
        start: selFourth.set({hour: 13, minute: 30}),
        end: selFourth.set({hour: 14, minute: 37}),
        location: 'WHOOP'
      },
      {
        title: 'Svenska hejhejhej 2',
        start: selFourth.set({hour: 11, minute: 30}),
        end: selFourth.set({hour: 11, minute: 55}),
        location: 'rummet'
      },

      {
        title: 'Svenska hejhejhej 3',
        start: selFourth.set({hour: 11, minute: 30}),
        end: selFourth.set({hour: 11, minute: 55}),
        location: 'rummet'
      }
    ]

    const selFifth = selFourth.plus({day: 1});
    const selFifthDay = [
      {
        title: 'Svenska',
        start: selFifth.set({hour: 12}),
        end: selFifth.set({hour: 13}),
        location: 'PBA'
      },
      {
        title: 'Svenska 2',
        start: selFifth.set({hour: 13, minute: 30}),
        end: selFifth.set({hour: 14, minute: 37}),
        location: 'WHOOP'
      },
      {
        title: 'Svenska hejhejhej 2',
        start: selFifth.set({hour: 11, minute: 30}),
        end: selFifth.set({hour: 11, minute: 55}),
        location: 'rummet'
      },

      {
        title: 'Svenska hejhejhej 3',
        start: selFifth.set({hour: 11, minute: 30}),
        end: selFifth.set({hour: 11, minute: 55}),
        location: 'rummet'
      }
    ]

    const selSixth = selFifth.plus({day: 1});
    const selSixthDay = [
      {
        title: 'Svenska',
        start: selSixth.set({hour: 12}),
        end: selSixth.set({hour: 13}),
        location: 'PBA'
      },
      {
        title: 'Svenska 2',
        start: selSixth.set({hour: 13, minute: 30}),
        end: selSixth.set({hour: 14, minute: 37}),
        location: 'WHOOP'
      },
      {
        title: 'Svenska hejhejhej 2',
        start: selSixth.set({hour: 11, minute: 30}),
        end: selSixth.set({hour: 11, minute: 55}),
        location: 'rummet'
      },

      {
        title: 'Svenska hejhejhej 3',
        start: selSixth.set({hour: 11, minute: 30}),
        end: selSixth.set({hour: 11, minute: 55}),
        location: 'rummet'
      }
    ]

    const selSeventh = selSixth.plus({day: 1});
    const selSeventhDay = [
      {
        title: 'Svenska',
        start: selSeventh.set({hour: 12}),
        end: selSeventh.set({hour: 13}),
        location: 'PBA'
      },
      {
        title: 'Svenska 2',
        start: selSeventh.set({hour: 13, minute: 30}),
        end: selSeventh.set({hour: 14, minute: 37}),
        location: 'WHOOP'
      },
      {
        title: 'Svenska hejhejhej 2',
        start: selSeventh.set({hour: 11, minute: 30}),
        end: selSeventh.set({hour: 11, minute: 55}),
        location: 'rummet'
      },

      {
        title: 'Svenska hejhejhej 3',
        start: selSeventh.set({hour: 11, minute: 30}),
        end: selSeventh.set({hour: 11, minute: 55}),
        location: 'rummet'
      }
    ]

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
          <div key={i} style={{left: `${(left * (i+1)) + (scalingNum * i)}%`, height: `${hourHeight * 24}px`}} className={styles.dayDivider}>

          </div>
        )
      }


      return dividers;

    }

    const generateDayIdentifier = (date) => {
      return (
        <div className={styles.dayIdentifier}>
          <p>{date.toFormat('cccc')}</p>
          <p>{date.toLocaleString({ month: 'long', day: 'numeric' })}</p>
        </div>
      )
    }

    //generate multiple days.
    const multipleDaySchedule = (data) => {

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

      sorted = [firstEvt.evt];

      setCompleteRender(
        <div className={styles.multipleDayExtraPositioning}>
          {completeRenderPreparer}
          {divider}
        </div>
      )

    }

    const sevenDayData = selDayData.concat(selSecondDay).concat(selThirdDay).concat(selFourthDay).concat(selFifthDay).concat(selSixthDay).concat(selSeventhDay);
    const threeDayData = selDayData.concat(selSecondDay).concat(selThirdDay);

    // oneDaySchedule(selDayData);
    // multipleDaySchedule(sevenDayData)

    const oneDaySchedule = (data) => {
      const oneDay = generateOneDaySchedule(selectedDay, hourHeight, data, {
        extraClass: styles.oneDaySchedule,
      });
      eventRenderers = oneDay.eventRenderers;
      sorted = oneDay.sorted;
      setCompleteRender(
        <div className={styles.oneDayContainer}>
          <div className={styles.oneDayTitle}>{generateDayIdentifier(selectedDay)}</div>
          {oneDay.completeRender}
        </div>
      )
    }


    switch(scheduleType) {
      case 'oneDay':
        oneDaySchedule(selDayData);
        break;
      case 'threeDay':
        multipleDaySchedule(threeDayData);
        break;
      case 'sevenDay':
        multipleDaySchedule(sevenDayData);
        break;
      case 'default':
        break;
    }

  }

  useEffect(() => {

    console.log("generating scheudle")

    generateSchedule();

  }, [currentDay])

  useEffect(() => {

    //scroll the calendar to the earliest event.
    if(sorted.length === 0) return;
    console.log(sorted)
    calendarElem.current.scrollTop = sorted[0].start.hour * hourHeight;

  }, [completeRender])

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

  const nav = (dir) => {

    let daysToAdd = 0;

    if(scheduleType === 'sevenDay') {
      daysToAdd = 7;
    }else if(scheduleType === 'threeDay') {
      daysToAdd = 3;
    }else if(scheduleType === 'oneDay') {
      daysToAdd = 1;
    }

    setCurrentDay(
      currentDay.plus({day: daysToAdd})
    )

  }

  return (
    <Layout mainClass={styles.headWrapper}>

      <div className={styles.wrapper}>

        <Sidebar />

        <div className={styles.calendarWrapper}>
          <p className={styles.pageTitle}>Calendar</p>

          <div className={styles.navigation}>
            <div onClick={() => nav(1)} className={styles.arrow}>
              <FontAwesomeIcon className={styles.icon} icon={faArrowRight} />
            </div>
          </div>

          <div ref={calendarElem} className={styles.calendar}>
            {completeRender}
            {segmentRenderers}
          </div>

        </div>


      </div>

    </Layout>
  )

}

export default Calendar;































//
