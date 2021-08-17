import React, { useState, useEffect } from 'react';

import dynamic from 'next/dynamic'


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

  let [grid, setGrid] = useState({});

  useEffect(() => {

    console.log("building module array")

    let modArray = arr.map((obj, index) => {

      let type = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);

      let elem = React.createElement(allModules[type])

      return (
        <div style={{gridColumn: obj.x + " / span " + obj.w, gridRow: obj.y + " / span " + obj.h}} className={styles.module} key={index}>
          {elem}
        </div>
      )
    })

    const modLen = modArray.length;
    let count = (6 * 5) - modLen;

    count += 4;

    // console.log(count)

    for(let i = 0; i < count; i++) {

      // console.log(i)

      let elem = (
        <div className={styles.module} key={i + modLen}>
          <div className={styles.viewer_module}>

          </div>
        </div>
      )

      modArray.push(elem);

    }

    setModules(modArray)

  }, [])


  useEffect(() => {

    if(!grid?._id && modules) {

      initializeMuuri();

    }

  }, [modules]);

  const initializeMuuri = async() => {

    console.log("initialzing muuri")

    //WebWorker?
    const Muuri = (await import('public/muuri.js')).default;

    setGrid(new Muuri(".muuri_grid", {dragEnabled: true}));


  }


  return (
    <>

      <div className={`${styles.wrapper} muuri_grid`}>

        {modules}

      </div>


    </>

  )

}

export default Grid;
