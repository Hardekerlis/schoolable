import React, { useState, useEffect } from 'react';

import styles from './grid.module.sass';

import allModules from './modules';

const arr = [
  {
    type: "nextEvent",
    x: 1,
    y: 1,
    w: 2,
    h: 1
  },
  {
    type: 'date',
    x: 3,
    y: 1,
    w: 1,
    h: 1
  }
]

const Grid = () => {

  let [modules, setModules] = useState();

  useEffect(() => {

    setModules(arr.map((obj, index) => {

      let type = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);

      let elem = React.createElement(allModules[type])

      return (
        <div style={{gridColumn: obj.x + " / span " + obj.w, gridRow: obj.y + " / span " + obj.h}} className={styles.module} key={index}>
          {elem}
        </div>
      )
    }))

  }, [])


  return (
    <div className={styles.wrapper}>

      {modules}

    </div>
  )

}

export default Grid;
