import React, { useEffect, useState } from 'react';

import language from 'helpers/lang';
const lang = language.coursePage.modules;

import {
  EditableModule
} from 'components';

import styles from './modules.module.sass';

const Modules = ({ _modules, setLoaderActive }) => {

  if(!_modules) _modules = [];

  let [modules, setModules] = useState(_modules);
  let [modulesRender, setModulesRender] = useState();

  useEffect(() => {
    setModulesRender(
      modules.map((obj, index) => {
        return (
          <EditableModule key={index} id={obj.id} name={obj.name} phases={obj.phases} />
        );
      }),
    );
  }, [modules]);

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
