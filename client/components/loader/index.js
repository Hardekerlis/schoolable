import React, { useEffect, useState } from 'react';

import { Loader as LoaderIcon } from 'helpers/systemIcons';

import styles from './loader.module.sass';

const Loader = ({ active, className }) => {

  let _className = (active) ? `${styles.wrapper} ${styles.open}` : styles.wrapper;
  if(className) _className += ` ${className}`

  return(
    <div className={_className}>
      {LoaderIcon}
    </div>
  )

}

export default Loader;
