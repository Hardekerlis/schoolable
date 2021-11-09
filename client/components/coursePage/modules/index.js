import React, { useEffect, useState } from 'react';

import language from 'helpers/lang';
const lang = language.coursePage.modules;

import {
  Module
} from 'components';

import {
  firstLetterToUpperCase
} from 'helpers';

import styles from './modules.module.sass';

const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Phase = ({ data }) => {

  // const paragraphs = data.page?.paragraphs;

  const [paragraphs, setParagraphs] = useState([]);
  const [paragraphsRender, setParagraphsRender] = useState([]);


  useEffect(() => {
    //data will only change when switching phases.
    //so load all data here.

    console.log("updating")

    console.log(data.page)

    if(!data.page || !data.page.paragraphs) {
      setParagraphs([]);
    }else {
      setParagraphs(data.page?.paragraphs)
    }

  }, [data])

  useEffect(() => {

    if(!paragraphs) return;

    setParagraphsRender(paragraphs.map((obj, index) => {

      if(obj.type === 'text') {
        return (
          <div key={index} className={styles.paragraph}>
            <p className={styles.text}>{obj.text}</p>
          </div>
        )
      }

      console.log("unsupported paragraph type")

    }))

  }, [paragraphs]);

  return(
    <div className={styles.phase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.title}>{firstLetterToUpperCase("" + data?.name)}</p>
        </div>

        <div className={styles.content}>
          {paragraphsRender}
        </div>

        <div className={styles.footer}>

        </div>
      </div>
    </div>
  )
}

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

    setModuleContainSelectedPhase(moduleIndex);

    setPhaseData(phase);

    setPhaseOpen(true)

  }

  useEffect(() => {
    setModulesRender(
      modules.map((obj, index) => {
        return (
          <Module removeSelected={(moduleContainSelectedPhase === index) ? false : true} onPhaseClick={(phase) => phaseClick(phase, index)} key={index} id={obj.id} name={obj.name} phases={obj.phases} />
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
      <Phase data={phaseData} />
    </div>
  )

}

export default Modules;
