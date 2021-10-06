import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { createStateListener } from 'helpers/stateEventListener.js';


import styles from './calendarTypeSelector.module.sass';

const CalendarTypeSelector = ({ isFullDesktop, types, scheduleType, setScheduleType }) => {

  const router = useRouter();

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

  const typeSelectors = types.map((obj, index) => {

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

  return(
    <>
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
    </>
  )

}

export default CalendarTypeSelector;
