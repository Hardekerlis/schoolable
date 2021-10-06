//lib imports

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { DateTime, Interval } from 'luxon';

import { faArrowRight, faArrowLeft, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

//custom imports

import Request from 'helpers/request.js'

import { Prompt } from 'helpers/prompt';

import Layout from 'layouts/default/';

import { Sidebar } from 'components'

import language from 'helpers/lang';
const lang = language.calendar;

import { createStateListener } from 'helpers/stateEventListener.js';

import timelineSchedule from './modules/timeline.js';

import isHoliday from './modules/holiday.js';

import { multipleDaySchedule, oneDaySchedule } from './modules/dayScheduleGeneration.js';
import monthSchedule from './modules/monthGeneration.js';

import { hourHeight } from './modules/misc.js';

//TEMP
import generateDayData from './modules/temp.js';
//!TEMP

//css imports

import styles from './calendar.module.sass';

export const getServerSideProps = async(ctx) => {

  let type = ctx.query?.type;
  if(!type) type = null;

  return {
    props: {
      sType: type
    }
  }

}

const Calendar = ({ sType }) => {

  const router = useRouter();

  let [isFullDesktop, setIsFullDesktop] = useState(true);

  const minDesktopWidth = 1250;

  const windowResize = () => {

    // console.log(isFullDesktop);
    // console.log(window.innerWidth)

    //TODO: save resize listener and ensure there's only one active

    // if(window.innerWidth < minDesktopWidth && isFullDesktop !== false) {
    //   setIsFullDesktop(false);
    // }else if(window.innerWidth > minDesktopWidth && isFullDesktop !== true) {
    //   setIsFullDesktop(true);
    // }

    if(window.innerWidth < minDesktopWidth) {
      setIsFullDesktop(false);
    }else if(window.innerWidth > minDesktopWidth) {
      setIsFullDesktop(true);
    }


  }

  if(typeof window !== 'undefined') {
    useEffect(() => {
      windowResize();
      window.addEventListener("resize", windowResize, false);
    }, [])
  }


  const typeSelectorsOptions = [
    {
      name: lang.oneDay,
      value: 'oneDay'
    },
    {
      name: lang.threeDay,
      value: 'threeDay'
    },
    {
      name: lang.sevenDay,
      value: 'week'
    },
    {
      name: lang.month,
      value: 'month'
    },
    {
      name: lang.timeline,
      value: 'timeline'
    }
  ];

  let _qFound = false;

  if(sType) {

    for(let obj of typeSelectorsOptions) {
      if(obj.value === sType) {
        _qFound = true;
        break;
      }
    }

  }

  if(!_qFound) {
    sType = 'week';

    useEffect(() => {

      router.push({
          pathname: '/calendar',
          query: {
            type: sType
          }
        },
        undefined,
        {
          shallow: true
        }
      )

    }, [])

  }

  let [scheduleType, setScheduleType] = useState(sType);
  let [currentDay, setCurrentDay] = useState(DateTime.now().startOf('day'));
  let [completeRender, setCompleteRender] = useState();
  let [renderNavigation, setRenderNavigation] = useState(true);

  let calendarElem = React.useRef();

  let navigated = false;

  let eventRenderers = [];
  let sorted = [];
  // let completeRender;

  const generateSchedule = () => {

     if(scheduleType === 'week')  {
       //find the corresponding sunday with todays date
        let day = currentDay.startOf('day');

        let weekday = parseFloat(day.toFormat('c'));

        if(weekday != 7) {
          day = day.minus({ day: weekday });
        }

     }

     const getCurrentDay = () => {
       let day = currentDay;

       if(scheduleType === 'week')  {
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
    // const selectedDay = DateTime.fromObject(selectedDayObject).set({month: 12, day: 23}).setZone("Sweden/Stockholm");

    const { sevenDayData, threeDayData, oneDayData } = generateDayData(selectedDay);


    const genMultipleDays = (data) => {

      let { jsx, firstEvent } = multipleDaySchedule(data, selectedDayObject);
      sorted = [firstEvent];
      setCompleteRender(jsx);

    }


    switch(scheduleType) {
      case 'oneDay':
        let { jsx, firstEvent } = oneDaySchedule(oneDayData);
        sorted = [firstEvent];
        setCompleteRender(jsx);
        break;
      case 'threeDay':
        genMultipleDays(threeDayData);
        break;
      case 'week':
        genMultipleDays(sevenDayData);
        break;
      case 'month':
        setCompleteRender(monthSchedule(currentDay));
        break;
      case 'timeline':
        setCompleteRender(timelineSchedule(sevenDayData, selectedDayObject));
        break;
      case 'default':
        break;
    }

  }


  useEffect(() => {

    if(scheduleType === 'timeline') setRenderNavigation(false);
    else if(renderNavigation === false) setRenderNavigation(true);

    console.log("generating schedule")

    generateSchedule();

  }, [currentDay, scheduleType])

  useEffect(() => {

    if(scheduleType === 'timeline') {
      if(!calendarElem.current) return;
      calendarElem.current.scrollTop = 0;
      return;
    }

    //scroll the calendar to the earliest event.
    if(sorted.length === 0) return;
    if(!calendarElem.current) return;
    calendarElem.current.scrollTop = sorted[0].start.hour * hourHeight;

  }, [sorted])

  //generating segment.
  //i.e the lines that indicate time.
  const segmentRenderers = [];

  if(scheduleType !== 'month' && scheduleType !== 'timeline') {
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

    if(scheduleType === 'week') {
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

  const scheduleTypeSelectorClicked = (value) => {

    if (scheduleType === value) return;

    setScheduleType(value);

    router.push({
        pathname: '/calendar',
        query: {
          type: value
        }
      },
      undefined,
      {
        shallow: true
      }
    )

  }

  const typeSelectors = typeSelectorsOptions.map((obj, index) => {

    const selectorClass = (scheduleType === obj.value) ? `${styles.selector} ${styles.selected}` : styles.selector;

    return (
      <div onClick={() => scheduleTypeSelectorClicked(obj.value)} key={index} className={selectorClass}>{obj.name}</div>
    )
  })

  //handling open and closing of dots menu
  //when not in full-desktop mode
  const subDesktopTypesListener = (evt, linkedState) => {
    if(linkedState.current === false) return;

    //TODO: probably more cross browser compatibility
    let evtPath = evt.path || evt.composedPath();

    let foundBars = false;

    for(let elem of evtPath) {
      if(elem.classList?.contains(styles.bars)) {
        foundBars = true;
        break;
      }
    }

    if(!foundBars) {
      setSubDesktopTypes(false);
    }

  }

  let [ subDesktopTypes, setSubDesktopTypes ] = createStateListener(false, '*', 'click', subDesktopTypesListener);

  let [subDesktopTypesClass, setSubDesktopTypesClass] = useState(styles.typeSelectorWrapper);

  const toggleSubDesktopTypes = () => {
    setSubDesktopTypes(!subDesktopTypes);
  }

  useEffect(() => {

    if(!subDesktopTypes && subDesktopTypesClass !== styles.typeSelectorWrapper) {
      setSubDesktopTypesClass(styles.typeSelectorWrapper);
    }else if(subDesktopTypes && subDesktopTypesClass !== `${styles.typeSelectorWrapper} ${styles.open}`) {
      setSubDesktopTypesClass(`${styles.typeSelectorWrapper} ${styles.open}`);
    }

  }, [subDesktopTypes])

  return (
    <Layout mainClass={styles.headWrapper}>

      <div className={(isFullDesktop) ? styles.wrapper : `${styles.wrapper} ${styles.mobile}`}>

        <Sidebar />

          <div className={styles.calendarWrapper}>

            <div className={styles.header}>

              <p className={styles.pageTitle}>Calendar</p>

              { isFullDesktop ?

                  <div className={styles.typeSelector}>
                    {typeSelectors}
                  </div>

                :
                  <div className={subDesktopTypesClass}>

                    <div onClick={() => toggleSubDesktopTypes()} className={styles.bars}>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>

                    <div className={styles.typeSelector}>
                      {typeSelectors}
                    </div>

                  </div>

              }



              <p className={styles.monthText}>{currentDay.toFormat('y, LLLL')}</p>

              <p className={styles.currentWeek}>{lang.shortWeekNumber}{currentDay.weekNumber}</p>

              { renderNavigation &&
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
              }

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

// { (scheduleType !== 'month' && scheduleType !== 'timeline') &&
//   <p className={styles.currentWeek}>{lang.shortWeekNumber}{currentDay.weekNumber}</p>
// }

export default Calendar;































//
