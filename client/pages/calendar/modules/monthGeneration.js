import isHoliday from './holiday.js';

import { DateTime, Interval } from 'luxon';

import styles from '../calendar.module.sass';

const monthSchedule = (currentDay) => {

  const firstDayOfMonth = currentDay.startOf('month');

  let firstDay = firstDayOfMonth.startOf('day');

  const weekday = parseFloat(firstDay.toFormat('c'));

  if(weekday != 7) {
    firstDay = firstDay.minus({ day: weekday }).startOf('day');
  }

  //calculating the amount of days to add at the beginning
  //of the month to make all rows include 7 days
  let prefixDays = 0;

  if(firstDay.toObject().month !== currentDay.toObject().month) {
    let interval = Interval.fromDateTimes(firstDay, firstDayOfMonth);
    prefixDays = interval.length('day');
  }

  let dayRenders = [];

  //the day which updates after one day have generated
  let workingDay = firstDay.startOf('day');

  //used for key to suffixDays
  let totalDays = prefixDays + firstDayOfMonth.daysInMonth;

  const dayJSX = (className, key) => {
    return (
      <div key={key} className={className}>
        <p className={styles.date}>{workingDay.toFormat('d')}</p>
      </div>
    )
  }

  //generating JSX for each day
  const addMonthDay = (i, addMonthText) => {
    let className = styles.monthDay;
    if(workingDay.startOf('day').toISO() === DateTime.now().startOf('day').toISO()) {
      className = `${styles.monthDay} ${styles.current}`;
    }

    if(workingDay.toObject().day === 1) {
      addMonthText = true;
    }


    if(isHoliday(workingDay)) {
      //is holiday
      className += ` ${styles.holiday}`;
    }


    if(addMonthText) {
      dayRenders.push(
        <div key={i} className={className}>
          <p className={styles.monthInDay}>{workingDay.toFormat('LLL')}</p>
          <p className={styles.date}>{workingDay.toFormat('d')}</p>
        </div>
      )
    }else {
      dayRenders.push(
        dayJSX(className, i)
      );
    }

    workingDay = workingDay.plus({day: 1})
  }

  //adding prefix days
  for(let i = 0; i < prefixDays; i++) {
    if(i === 0) addMonthDay(i, true);
    else addMonthDay(i);
  }

  //adding all days from the current month
  for(let i = 0; i <= firstDayOfMonth.daysInMonth; i++) {
    addMonthDay(prefixDays + i);
  }

  //how many days to add to end of month
  let suffixDays = 0;

  //fixing an edge case where a whole week from the next
  //month would show up
  if(workingDay.minus({day: 1}).toObject().month !== firstDayOfMonth.toObject().month) {
    if(workingDay.minus({day: 2}).toObject().day === firstDayOfMonth.daysInMonth) {
      if(parseFloat(workingDay.minus({day: 2}).toFormat('c')) === 6) {
        dayRenders.pop();
        suffixDays = -1;
      }
    }
  }

  //calculate have many days to add to end of month
  //so all rows include 7 days
  let suffixWeekday = parseFloat(workingDay.toFormat('c'));

  if(suffixDays !== -1) {
    if(suffixWeekday < 6) {
      suffixDays = 6 - parseFloat(workingDay.toFormat('c'));
    }else if(suffixWeekday > 6) {
      suffixDays = -1;
    }

  }

  for(let i = 0; i <= suffixDays; i++) {
    addMonthDay(totalDays + i + 1);
  }

  //generating week day texts
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

  //updating the render
  return(
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

export default monthSchedule;
