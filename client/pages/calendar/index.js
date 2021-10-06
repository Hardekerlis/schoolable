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

import { OneDaySchedule, MultipleDaySchedule, Month, Timeline, CalendarTypeSelector } from 'components'

import { hourHeight } from 'components/calendar/misc.js'

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

  let sevenDayData;
  let threeDayData;
  let oneDayData;

  const _data = generateDayData(currentDay);
  sevenDayData = _data.sevenDayData;
  threeDayData = _data.threeDayData;
  oneDayData = _data.oneDayData;


  const generateSchedule = () => {

    //TODO: ALWAYS START ON SUNDAY

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

          console.log("sunday")

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

    // const _data = generateDayData(selectedDay);
    // sevenDayData = _data.sevenDayData;
    // threeDayData = _data.threeDayData;
    // oneDayData = _data.oneDayData;


    switch(scheduleType) {
      case 'oneDay':
        setCompleteRender(OneDaySchedule(oneDayData));
        break;
      case 'threeDay':
        setCompleteRender(MultipleDaySchedule(threeDayData));
        break;
      case 'week':
        setCompleteRender(MultipleDaySchedule(sevenDayData));
        break;
      case 'month':
        setCompleteRender(<Month date={currentDay} />);
        break;
      case 'timeline':
        // setCompleteRender(Timeline(sevenDayData, selectedDayObject));
        setCompleteRender(<Timeline data={sevenDayData} date={selectedDayObject} />);
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
    if(!calendarElem.current) return;

    calendarElem.current.scrollTop = (11 * hourHeight) - 40;

    if(sorted.length === 0) return;

    //40 = fullDayEventHeight + 10px padding
    // calendarElem.current.scrollTop = (sorted[0].start.hour * hourHeight) - 40;


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

  const goToToday = () => {
    setCurrentDay(DateTime.now().startOf('day'));
  }

  return (
    <Layout mainClass={styles.headWrapper}>

      <div className={(isFullDesktop) ? styles.wrapper : `${styles.wrapper} ${styles.mobile}`}>

        <Sidebar />

          <div className={styles.calendarWrapper}>

            <div className={styles.header}>

              <p className={styles.pageTitle}>Calendar</p>

              <div onClick={goToToday} className={styles.todayBtn}>
                {lang.today}
              </div>

              <CalendarTypeSelector isFullDesktop={isFullDesktop} setScheduleType={setScheduleType} scheduleType={scheduleType} types={typeSelectorsOptions} />

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
