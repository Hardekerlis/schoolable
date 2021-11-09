import React, { useEffect, useState } from 'react';

import { IconRenderer } from 'helpers/systemIcons';

import styles from './courseNavigation.module.sass';

const CourseNavigation = ({ options }) => {

  const optionHeight = 75;

  // console.log(options)

  const renderers = options.map((obj, index) => {

    return (
      <div style={{bottom: `${10 + ((10 + optionHeight) * index)}px`}} key={index} onClick={obj.onClick} className={styles.option}>
        <IconRenderer onHover={{
          text: obj.text,
          direction: 'right'
        }} className={(obj.className) ? `${obj.className} ${styles.icon}` : styles.icon} icon={obj.icon} />
      </div>
    )

  })

  return(
    <div className={styles.wrapper}>
      {renderers}
    </div>
  )

}

export default CourseNavigation;
