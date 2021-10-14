import React, { useEffect, useState } from 'react';

import styles from './rightClickMenu.module.sass';

const RightClickMenu = ({  }) => {

  const options = [
    {
      name: 'Click A'
    },
    {
      name: 'Click B',
    }
  ]

  const renderers = options.map((obj, index) => {

    return (
      <div className={styles.option}>
        <p>{obj.name}</p>
      </div>
    )

  })

  return(
    <div className={styles.wrapper}>
      <p className={styles.headline}>Menu</p>
      <div className={styles.line}></div>
      {renderers}
    </div>
  )

}

export default RightClickMenu;
