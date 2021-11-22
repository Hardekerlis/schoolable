import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

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

  const router = useRouter();

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

    updateQueryWithPhase(phase);

  }

  //query handling

  const updateQueryWithPhase = phase => {
    console.log(phase)
    if(!phase) return;
    router.replace(`${router.pathname}?id=${router.query.id}&sub=${router.query.sub}&phase=${phase.id}`);
  }

  //check query if a phase is requested.

  const [phaseQueryHandled, setPhaseQueryHandled] = useState(false);
  //it's fine to use index here. because it will only run before
  //user interaction. meaning it will not be disturbed by any ordering.
  //!!make sure that the modules array is in equal to sortableList index-wise
  const [queryPhaseModuleIndex, setQueryPhaseModuleIndex] = useState(-1);
  const [queryPhaseIndex, setQueryPhaseIndex] = useState(-1);

  useEffect(() => {

    if(phaseQueryHandled) return;
    if(modules.length === 0) return;

    if(!router.query.phase) return;

    setPhaseQueryHandled(true);

    let foundPhase = false;
    let moduleIndex = 0;
    let phaseIndex = 0;

    for(let _module of modules) {
      if(foundPhase) break;
      for(let phase of _module.phases) {
        if(phase.id === router.query.phase) {
          setQueryPhaseModuleIndex(moduleIndex);
          setQueryPhaseIndex(phaseIndex);
          foundPhase = true;
          break;
        }
        phaseIndex++;
      }
      phaseIndex = 0;
      moduleIndex++;
    }

  }, [modules])


  useEffect(() => {
    setModulesRender(
      modules.map((obj, index) => {
        // console.log(queryPhaseModuleIndex, queryPhaseIndex)
        return (
          <Module
            removeSelected={(moduleContainSelectedPhase === index) ? false : true}
            onPhaseClick={(phase) => phaseClick(phase, index)}
            key={index}
            name={obj.name}
            phases={obj.phases}
            queryPhase={(index === queryPhaseModuleIndex) ? queryPhaseIndex : false}
            phaseQueryHandledInModules={phaseQueryHandled}
          />
        );
      }),
    );
  }, [modules, phaseOpen, moduleContainSelectedPhase, queryPhaseIndex]);

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
