import React, { useEffect, useState } from 'react';

import { Loader as LoaderIcon } from 'helpers/systemIcons';

import styles from './loader.module.sass';

const Loader = ({ active }) => {

  return(
    <div className={(active) ? `${styles.wrapper} ${styles.open}` : styles.wrapper}>
      {LoaderIcon}
    </div>
  )

}

export default Loader;
