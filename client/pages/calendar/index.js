//lib imports

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { DateTime, Interval } from 'luxon';


import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

//custom imports



import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar } from 'components'

import language from 'helpers/lang';
const lang = language.calendar;


import generateOneDaySchedule from './oneDay.js';

//css imports

import styles from './calendar.module.sass';

const Calendar = () => {

  let calendarElem = React.useRef();

  let [scheduleType, setScheduleType] = useState('month');
  let [currentDay, setCurrentDay] = useState(DateTime.now().startOf('day'));
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
        let day = currentDay.startOf('day');

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
        start: selSecond.set({hour: 12, minute: 30}),
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
          <div key={i} style={{left: `${(left * (i+1)) + (scalingNum * i)}%`, height: `${hourHeight * 24}px`}} className={styles.dayDivider}></div>
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

    const monthSchedule = () => {

      const firstDayOfMonth = currentDay.startOf('month');

      let firstDay = firstDayOfMonth.startOf('day');

      const weekday = parseFloat(firstDay.toFormat('c'));

      if(weekday != 7) {
        firstDay = firstDay.minus({ day: weekday }).startOf('day');
      }

      let prefixDays = 0;

      if(firstDay.toObject().month !== currentDay.toObject().month) {
        let interval = Interval.fromDateTimes(firstDay, firstDayOfMonth);
        prefixDays = interval.length('day');
      }

      let dayRenders = [];

      let workingDay = firstDay.startOf('day');

      let totalDays = prefixDays + firstDayOfMonth.daysInMonth;

      const addMonthDay = (i) => {

        dayRenders.push(
          <div key={i} className={styles.monthDay}>
            <p className={styles.date}>{workingDay.toFormat('d')}</p>
          </div>
        );

        workingDay = workingDay.plus({day: 1})

      }


      for(let i = 0; i < prefixDays; i++) {

        addMonthDay(i);

      }

      for(let i = 0; i <= firstDayOfMonth.daysInMonth; i++) {

        addMonthDay(prefixDays + i);

      }

      let suffixDays = 0;

      if(workingDay.minus({day: 1}).toObject().month !== firstDayOfMonth.toObject().month) {
        // console.log(, firstDayOfMonth.daysInMonth)
        if(workingDay.minus({day: 2}).toObject().day === firstDayOfMonth.daysInMonth) {
          if(parseFloat(workingDay.minus({day: 2}).toFormat('c')) === 6) {
            dayRenders.pop();
            suffixDays = -1;
          }
        }
      }

      console.log(workingDay.toObject())
      console.log(firstDayOfMonth.toObject())
      console.log(firstDayOfMonth.daysInMonth)

      let suffixWeekday = parseFloat(workingDay.toFormat('c'));

      // console.log(workingDay.toObject())
      // console.log(parseFloat(workingDay.toFormat('c')))

      if(suffixDays !== -1) {
        if(suffixWeekday < 6) {
          // suffixDays = 6 - workingDay.toObject().day;
          suffixDays = 6 - parseFloat(workingDay.toFormat('c'));
        }else if(suffixWeekday > 6) {
          suffixDays = -1;
        }

      }


      for(let i = 0; i <= suffixDays; i++) {

        addMonthDay(totalDays + i + 1);

      }

      let dayIdentifiers = [];
      let dayBuildHelper = workingDay.set({weekDay: 0});

      for(let i = 0; i < 7; i++) {
        dayIdentifiers.push(
          <div key={"id" + i} className={styles.monthDayIdentifier}>
            {dayBuildHelper.toFormat('cccc')}
          </div>
        )
        dayBuildHelper = dayBuildHelper.plus({day: 1})
      }

      setCompleteRender(
        <div className={styles.monthContainer}>
          <div className={styles.dayIds}>
            {dayIdentifiers}
          </div>
          <div className={styles.month}>
            {dayRenders}
          </div>
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
      case 'month':
        monthSchedule();
        break;
      case 'default':
        break;
    }

  }

  useEffect(() => {

    console.log("generating schedule")

    generateSchedule();

  }, [currentDay, scheduleType])

  useEffect(() => {

    //scroll the calendar to the earliest event.
    if(sorted.length === 0) return;
    calendarElem.current.scrollTop = sorted[0].start.hour * hourHeight;

  }, [sorted])

  //generating segment.
  //i.e the lines that indicate time.
  const segmentRenderers = [];

  if(scheduleType !== 'month') {
    for(let i = 0; i < 24; i++) {

      segmentRenderers.push(
        <div style={{top: (hourHeight * i) + "px"}} key={i} className={styles.segment}>
          <div className={styles.line}></div>
          <p className={styles.hour}>{`${i}:00`}</p>
        </div>
      )

    }
  }

  const nav = (dir) => {

    let daysToAdd = 0;

    if(scheduleType === 'sevenDay') {
      daysToAdd = 7;
    }else if(scheduleType === 'threeDay') {
      daysToAdd = 3;
    }else if(scheduleType === 'oneDay') {
      daysToAdd = 1;
    }else if(scheduleType === 'month') {
      setCurrentDay(
        currentDay.plus({month: dir})
      )
      return;
    }

    setCurrentDay(
      currentDay.plus({day: daysToAdd * dir})
    )

  }

  const typeSelectorsOptions = [
    {
      name: 'One day',
      value: 'oneDay'
    },
    {
      name: 'Three day',
      value: 'threeDay'
    },
    {
      name: 'Week',
      value: 'sevenDay'
    },
    {
      name: 'Month',
      value: 'month'
    }
  ];

  const scheduleTypeSelectorClicked = (value) => {

    if (scheduleType === value) return;

    setScheduleType(value);

  }

  const typeSelectors = typeSelectorsOptions.map((obj, index) => {

    const selectorClass = (scheduleType === obj.value) ? `${styles.selector} ${styles.selected}` : styles.selector;

    return (
      <div onClick={() => scheduleTypeSelectorClicked(obj.value)} key={index} className={selectorClass}>{obj.name}</div>
    )
  })

  return (
    <Layout mainClass={styles.headWrapper}>

      <div className={styles.wrapper}>

        <Sidebar />

        <div className={styles.calendarWrapper}>

          <p className={styles.pageTitle}>Calendar</p>

          <div className={styles.typeSelector}>
            {typeSelectors}
          </div>


          <div className={styles.navigation}>
            <div className={styles.arrowContainer}>
              <div onClick={() => nav(-1)} className={styles.arrow}>
                <FontAwesomeIcon className={styles.icon} icon={faArrowLeft} />
              </div>
              <div onClick={() => nav(1)} className={styles.arrow}>
                <FontAwesomeIcon className={styles.icon} icon={faArrowRight} />
              </div>
            </div>
          </div>

          { (scheduleType !== 'month') &&
            <p className={styles.currentWeek}>{lang.shortWeekNumber}{currentDay.weekNumber}</p>
          }


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
