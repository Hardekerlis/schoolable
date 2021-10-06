import { OneDay, DayIdentifier, DayDividers } from 'components/calendar'

import { DateTime, Interval } from 'luxon';


import styles from './daySchedules.module.sass';


//generate multiple days.
const MultipleDaySchedule = (data, selectedDayObject) => {

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

    completeRenderPreparer.push(
      <div key={i} className={(isSevenDay) ? styles.completeSevenEventDay : styles.completeThreeEventDay}>
        <DayIdentifier date={dayDate} />
        <OneDay day={dayDate} data={dayData} options={{
          extraClass: styles.multipleDaySchedule,
          eventsClass: styles.multipleDayEvents,
          sevenDaySchedule: isSevenDay
        }} />
      </div>
    )

  }

  return (
    <div className={styles.multipleDayExtraPositioning}>
      {completeRenderPreparer}
      <DayDividers amount={Object.keys(master).length} />
    </div>
  )
}

const OneDaySchedule = (data) => {
  let d = data[0].start.startOf('day');

  return (
    <div className={styles.oneDayContainer}>
      <div className={styles.oneDayTitle}><DayIdentifier date={d}/></div>
      <OneDay day={d} data={data} options={{
        extraClass: styles.oneDaySchedule,
        fullDayClass: styles.fullDayContainer
      }} />
    </div>
  )

}


export {
  MultipleDaySchedule,
  OneDaySchedule
}
