import React, { useEffect, useState } from 'react';


import language from 'helpers/lang';
const lang = language.coursePage.modules;

import {
  RightArrow,
  Checkbox,
  CheckboxChecked
} from 'helpers/systemIcons';

import {
  Module
} from 'components';

import {
  firstLetterToUpperCase,
  IconRenderer,
  Logger
} from 'helpers';

import Phase from './phase';

const logger = new Logger('/coursePage/modules/index.js');

import styles from './modules.module.sass';

const Modules = ({ _modules, setLoaderActive }) => {

  if(!_modules) _modules = [];

  const [modules, setModules] = useState(_modules);
  const [modulesRender, setModulesRender] = useState();
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [phaseData, setPhaseData] = useState({});

  //basically if no phase in a module is the one selected. remove any selected phases from that module
  //sounds a bit weird. But each module keeps track of which phase is selected locally
  //so if a modules locally selected phase doesn't match the actual selected phase, remove it
  //checks if current selected phase is in that module if it's not remove the locally selected
  //phase
  const [moduleContainSelectedPhase, setModuleContainSelectedPhase] = useState(-1);

  const phaseClick = (phase, moduleIndex) => {

    if(phase === -1) {
      //close phasePage
      setPhaseOpen(false)
      return;
    }

    setModuleContainSelectedPhase(moduleIndex);

    setPhaseData(phase);

    setPhaseOpen(true)

  }

  useEffect(() => {
    setModulesRender(
      modules.map((obj, index) => {
        return (
          <Module removeSelected={(moduleContainSelectedPhase === index) ? false : true} onPhaseClick={(phase) => phaseClick(phase, index)} key={index} name={obj.name} phases={obj.phases} />
        );
      }),
    );
  }, [modules, phaseOpen, moduleContainSelectedPhase]);

  return(
    <div className={(phaseOpen) ? `${styles.page} ${styles.minified}` : styles.page}>
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
      <Phase className={styles.phase} data={phaseData} />
    </div>
  )

}

export default Modules;
