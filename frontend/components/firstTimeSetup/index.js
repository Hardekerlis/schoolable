import React, { useState, useEffect } from 'react';

import styles from './firstTimeSetup.module.sass';

import setupOptions from './setupOptions.js'
// import Option from './option.js'

const FirstTimeSetup = () => {

  const [currentIndex, setCurrentIndex] = useState(0)
  const [current, setCurrent] = useState({
    name: 'UNSET',
    html: 'UNSET'
  })


  const options = setupOptions.map((opt, index) => {

    opt.method = (e) => {
      console.log(current)
    }

    return opt;
  })

  if(current.name === 'UNSET') {
    setCurrent(options[0]);
  }


  useEffect(() => {

    // console.log(current, 28);

  })

  const changePage = (dir) => {

    console.log(dir);

  }

  return (
    <div className={styles.wrapper}>

      <div className={styles.container}>
        <p className={styles.title}>First-time setup</p>
        <div className="hoz_line"></div>

        <div className={styles.optionContainer}>
          <p className={styles.optionTitle}>{current.name}</p>
          <div className={styles.body}>
            {current.html}
          </div>
        </div>


        <div className={styles.btnContainer}>
          <button onClick={() => changePage(-1)}>Previous</button>
          <button onClick={() => changePage(1)}>Next</button>
        </div>


      </div>

    </div>
  )

}

export default FirstTimeSetup;
