import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import language from 'helpers/lang';
const lang = language.coursePageEdit.modules;

import { ReactSortable, Sortable, MultiDrag, Swap } from "react-sortablejs";





import {
  PlusClipboard,
  Drag,
  RightArrow
} from 'helpers/systemIcons'

import {
  EditableModule,
  SampleCreationSystem,
} from 'components';

import {
  Prompt,
  IconRenderer
} from 'helpers';

import Phase from './phase';


import styles from './modules.module.sass';

const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Modules = ({ _modules, course, setLoaderActive }) => {



  if(!_modules) _modules = [];

  //temp
  _modules.forEach((obj, index) => {
    // console.log(obj, index)
    obj.order = index;
  })

  const [modules, setModules] = useState(_modules);
  const [modulesRender, setModulesRender] = useState([]);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [phaseData, setPhaseData] = useState({});

  // const [currentlyDragging, setCurrentlyDragging] = useState(null);

  let currentlyDragging = null;

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


  const onModuleCreation = async response => {
    // console.log(response);

    if(response.errors === false) {
      let arr = modules.slice();

      arr.push(response.module);

      setModules(arr);

      Prompt.success(lang.moduleCreated);
      return true;
    }else {
      Prompt.error(response.errors);
      return false;
    }

    //return false for error.
  };


  // useEffect(() => {
  //   setModulesRender(
  //     modules.map((obj, index) => {
  //
  //       // console.log(obj)
  //       // obj.elemId = `${nanoid(6)}_${obj.order}`;
  //
  //       // console.log(obj.elemId)
  //
  //       //
  //
  //       return (
  //         <EditableModule onPhaseClick={(phase) => phaseClick(phase, index)} elemId={obj.elemId} removeSelected={(moduleContainSelectedPhase === index) ? false : true} key={index} name={obj.name} phases={obj.phases} />
  //       );
  //     }),
  //   );
  // }, [modules, phaseOpen, moduleContainSelectedPhase]);



  const [sortableList, setSortableList] = useState([]);

  useEffect(() => {

    setSortableList(modules.map((obj, index) => {

      return {
        name: obj.name,
        id: obj.id,
        phases: obj.phases
      }

    }))


  }, [modules, phaseOpen, moduleContainSelectedPhase])

  let sortableClassName = `${styles.sortable}`;

  const [isAModuleChosen, setIsAModuleChosen] = useState(false);

  useEffect(() => {

    let hasAChosen = false;

    for(let obj of sortableList) {
      if(obj.chosen) {
        hasAChosen = true;
        break;
      }
    }

    setIsAModuleChosen(hasAChosen);

  }, [sortableList])

  return(
    <div className={(phaseOpen) ? `${styles.page} ${styles.minified}` : styles.page}>
      <div className={styles.wrapper}>
        {sortableList?.length === 0 ? (
          <p className={styles.noModulesText}>{lang.noModulesText}</p>
        ) : (
          <>
            <p className={styles.modulesText}>{lang.modules}</p>

            <div className={styles.modulesContainer}>
              <ReactSortable
                tag="div"
                className={sortableClassName}
                list={sortableList}
                setList={setSortableList}
                handle={`.sortable_draggable`}
                animation={200}
              >
                {sortableList.map((obj, index) => {
                  return (<EditableModule sortableHasOneChosen={isAModuleChosen} chosen={obj.chosen} onPhaseClick={(phase) => phaseClick(phase, index)} removeSelected={(moduleContainSelectedPhase === index) ? false : true} key={obj.id} name={obj.name} phases={obj.phases} />)
                })}
              </ReactSortable>

            </div>
          </>
        )}
        <SampleCreationSystem
          creationContainerClassName={styles.creationContainer}
          body={{
            parentCourseId: course.id,
          }}
          createItemButtonClassName={styles.createModuleButton}
          requestCallback={onModuleCreation}
          itemApiPath={`/api/modules/create`}
          currentItems={modules}
          itemName={lang.moduleItemName}
          noCurrentItemText={lang.courseMissingModules}
          createAdditionalItemIcon={PlusClipboard}
        />
      </div>
      <Phase className={styles.phase} data={phaseData} />
    </div>
  )

}

export default Modules;
