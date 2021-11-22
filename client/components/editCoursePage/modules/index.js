import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

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
  IconRenderer,
  Request,
  GlobalEventHandler
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

  const router = useRouter();

  const [modules, setModules] = useState([]);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [phaseData, setPhaseData] = useState({});

  useEffect(() => {

    //sort based by order attribute. when fetching from server

    //temp
    _modules.forEach((obj, index) => {
      // console.log(obj, index)
      obj.order = index;

      obj.phases.forEach((phase, i) => {

        phase.order = i;

      })


    })
    //!


    setModules(_modules)
  }, [])


  //basically if no phase in a module is the one selected. remove any selected phases from that module
  //sounds a bit weird. But each module keeps track of which phase is selected locally
  //so if a modules locally selected phase doesn't match the actual selected phase, remove it
  //checks if current selected phase is in that module if it's not remove the locally selected
  //phase

  //changing from index to id based
  const [moduleContainSelectedPhase, setModuleContainSelectedPhase] = useState(-1);

  const phaseClick = (phase, moduleId) => {

    if(phase === -1) {
      //close phasePage
      setPhaseOpen(false)
      return;
    }

    setModuleContainSelectedPhase(moduleId);

    setPhaseData(phase);

    setPhaseOpen(true);

    updateQueryWithPhase(phase)

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



  const [sortableList, setSortableList] = useState([]);

  useEffect(() => {

    setSortableList(modules.map((obj, index) => {


      return {
        name: obj.name,
        id: obj.id,
        phases: obj.phases,
        order: obj.order
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


  const movedModule = (evt) => {

    //state has been updated for sortableList

    //update order on modules

    const newModulesArray = modules.slice();

    sortableList.forEach((item, index) => {

      //item.order is the index for the item in modules

      newModulesArray[item.order].order = index;
      item.order = index;

    })

    //call sort because modules will be updated
    newModulesArray.sort((obj1, obj2) => {
      return obj1.order - obj2.order;
    })

    setModules(newModulesArray);

  }

  //only used for list positioning
  //the equal to the phase page or anything else.
  const [currentlyChosenPhase, setCurrentlyChosenPhase] = useState(null);

  const onPhaseChosen = (phaseData) => {
    setCurrentlyChosenPhase(phaseData);
  }

  const fetchChosenPhase = () => {
    return currentlyChosenPhase;
  }

  const [draggingPhase, setDraggingPhase] = useState(false);
  const draggingPhaseRef = React.useRef(false);

  const setDraggingPhaseState = (bool) => {
    draggingPhaseRef.current = bool;
    setDraggingPhase(bool)
  }

  const onPhaseMove = evt => {
    return true;
  }


  useEffect(() => {

    const maxDepth = 5;

    let hoveringOverClosed = {
      elem: null,
      index: null
    }

    let timeout;

    const resetHoveringOverClosed = () => {
      hoveringOverClosed = {
        elem: null,
        index: null
      }
      clearTimeout(timeout)
    }

    const openHoveringModule = () => {

      //children[0] = textContainer
      hoveringOverClosed.elem.children[0].click()

      resetHoveringOverClosed();

    }

    const currentModuleHover = (moduleIndex, elem) => {

      if(elem.classList.contains('_this_module_open')) {
        resetHoveringOverClosed();
        return
      }else {
        //module is closed. open in about 1500ms

        if(hoveringOverClosed.elem) {
          if(hoveringOverClosed.elem !== elem) {
            resetHoveringOverClosed();
          }
          return;
        }

        hoveringOverClosed = {
          elem,
          index: moduleIndex
        }

        timeout = setTimeout(() => {

          openHoveringModule();

        }, 600)


      }
    }

    let subscription = GlobalEventHandler.subscribe('windowMouseMove', (evt) => {
      if(draggingPhaseRef.current === true) {
        //is dragging phase
        //check if hovering over closed module.

        let index = 0;
        //TODO: cross browser evt.path
        for(let elem of evt.path) {

          if(index >= maxDepth) break;
          index++;

          let dataIndex = null;

          try {
            dataIndex = elem?.getAttribute('data-index');
          }catch(err) {
            continue;
          }

          if(!dataIndex) continue;

          //dataIndex = index of current modules hovering over.

          currentModuleHover(dataIndex, elem);

        }
      }
    })

    return () => {
      subscription.unsubscribe();
    }

  }, [])


  //query handling

  const updateQueryWithPhase = phase => {
    router.replace(`${router.pathname}?id=${router.query.id}&sub=${router.query.sub}&phase=${phase.id}`);
  }

  //check query if a phase is requested.

  const [phaseQueryHandled, setPhaseQueryHandled] = useState(false);
  //it's fine to use index here. because it will only run before
  //user interaction. meaning it will not be disturbed by any ordering.
  //!!make sure that the modules array is in equal to sortableList index-wise
  const [queryPhaseModuleIndex, setQueryPhaseModuleIndex] = useState(-1);
  const [queryPhaseIndex, setQueryPhaseIndex] = useState(-1)

  useEffect(() => {

    if(phaseQueryHandled) return;
    if(modules.length === 0) return;

    if(!router.query.phase) return;

    setPhaseQueryHandled(true);

    let foundPhase = false;
    for(let _module of modules) {
      if(foundPhase) break;
      for(let phase of _module.phases) {

        if(phase.id === router.query.phase) {
          setQueryPhaseModuleIndex(_module.order);
          setQueryPhaseIndex(phase.order);
          foundPhase = true;
          break;
        }

      }
    }

  }, [modules])



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
                swapThreshold={0.65}
                group={{ name: 'root', put: ['nested'], pull: 'root' }}
                onEnd={movedModule}
                forceFallback={true}
              >

              {sortableList.map((obj, index) =>
                <EditableModule
                  dataIndex={index}
                  sortableHasOneChosen={isAModuleChosen}
                  chosen={obj.chosen}
                  onPhaseClick={(phase) => phaseClick(phase, obj.id)}
                  removeSelected={(moduleContainSelectedPhase === obj.id) ? false : true}
                  key={obj.id}
                  name={obj.name}
                  moduleId={obj.id}
                  _phases={obj.phases}
                  onPhaseChosen={onPhaseChosen}
                  fetchChosenPhase={fetchChosenPhase}
                  onPhaseMove={onPhaseMove}
                  setDraggingPhase={setDraggingPhaseState}
                  queryPhase={(index === queryPhaseModuleIndex) ? queryPhaseIndex : false}
                />
              )}

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
