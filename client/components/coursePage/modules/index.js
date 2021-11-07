import React, { useEffect, useState } from 'react';

import language from 'helpers/lang';
const lang = language.coursePage.modules;

import styles from './modules.module.sass';

const Modules = ({ modulesRender }) => {

  return(
    <div className={styles.wrapper}>
      {modulesRender?.length === 0 ? (
        <p className={styles.noModulesText}>{lang.noModulesText}</p>
      ) : (
        <>
          <p className={styles.modulesText}>{lang.modules}</p>

          <div className={styles.modulesContainer}>
            {modulesRender}
          </div>
        </>
      )}
    </div>
  )

}

export default Modules;
