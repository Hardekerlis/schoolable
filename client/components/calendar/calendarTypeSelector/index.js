import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { GlobalEventHandler } from 'helpers';

import styles from './calendarTypeSelector.module.sass';

const CalendarTypeSelector = ({
  isFullDesktop,
  types,
  scheduleType,
  setScheduleType,
}) => {
  const router = useRouter();

  const scheduleTypeSelectorClicked = value => {
    if(scheduleType === value) return;

    setScheduleType(value);

    router.push(
      {
        pathname: '/calendar',
        query: {
          type: value,
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  };

  const typeSelectors = types.map((obj, index) => {
    const selectorClass =
      scheduleType === obj.value
        ? `${styles.selector} ${styles.selected}`
        : styles.selector;

    return (
      <div
        onClick={() => scheduleTypeSelectorClicked(obj.value)}
        key={index}
        className={selectorClass}
      >
        {obj.name}
      </div>
    );
  });

  //handling open and closing of dots menu
  //when not in full-desktop mode
  const subDesktopTypesListener = evt => {
    //TODO: probably more cross browser compatibility
    let evtPath = evt.path || evt.composedPath();

    let foundBars = false;

    for (let elem of evtPath) {
      if(elem.classList?.contains(styles.bars)) {
        foundBars = true;
        break;
      }
    }

    if(!foundBars) {
      setSubDesktopTypes(false);
    }
  };

  let [subDesktopTypes, setSubDesktopTypes] = useState(false);

  let [listener, setListener] = useState();

  useEffect(() => {
    setListener(
      GlobalEventHandler.subscribe(
        'windowClick',
        subDesktopTypesListener,
      ).active(false),
    );

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  let [subDesktopTypesClass, setSubDesktopTypesClass] = useState(
    styles.typeSelectorWrapper,
  );

  const toggleSubDesktopTypes = () => {
    setSubDesktopTypes(!subDesktopTypes);
  };

  useEffect(() => {
    if(
      !subDesktopTypes &&
      subDesktopTypesClass !== styles.typeSelectorWrapper
    ) {
      setSubDesktopTypesClass(styles.typeSelectorWrapper);
    }else if(
      subDesktopTypes &&
      subDesktopTypesClass !== `${styles.typeSelectorWrapper} ${styles.open}`
    ) {
      setSubDesktopTypesClass(`${styles.typeSelectorWrapper} ${styles.open}`);
    }

    listener?.active(subDesktopTypes);
  }, [subDesktopTypes]);

  return (
    <>
      {isFullDesktop ? (
        <div className={styles.typeSelector}>{typeSelectors}</div>
      ) : (
        <div className={subDesktopTypesClass}>
          <div onClick={() => toggleSubDesktopTypes()} className={styles.bars}>
            <div></div>
            <div></div>
            <div></div>
          </div>

          <div className={styles.typeSelector}>{typeSelectors}</div>
        </div>
      )}
    </>
  );
};

export default CalendarTypeSelector;
