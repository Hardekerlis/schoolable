import { DateTime, Interval } from 'luxon';

import Holidays from 'date-holidays';
let hd = new Holidays();

//initialize holidays for the users contry
hd.init('SE');

const isHoliday = date => {
  let holiday = false;

  let _weekday = parseFloat(date.toFormat('c'));

  if(_weekday === 7) holiday = true;

  let _hdHoliday = hd.isHoliday(date.startOf('day').toJSDate());

  if(_hdHoliday !== false) {
    holiday = true;
  }

  return holiday;
};

export default isHoliday;
