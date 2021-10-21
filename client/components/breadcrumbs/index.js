import React, { useEffect, useState } from 'react';

import { RightArrow } from 'helpers/systemIcons';

import styles from './breadcrumbs.module.sass';

const Breadcrumbs = ({ options }) => {

  const optionsRender = options.map((obj, index) => {

    return (
      <div key={index} onClick={obj.onClick}>
        <p className={(obj.selected) && styles.selected}>{obj.name}</p>
        { index !== 0 &&
          <> { RightArrow } </>
        }
      </div>
    )
  })

  return(
    <div className={styles.wrapper}>
      {optionsRender}
    </div>
  )

}

export default Breadcrumbs;
