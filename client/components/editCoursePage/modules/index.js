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
  IconRenderer,
  Request
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

  console.log(_modules)


  const [modules, setModules] = useState([]);
  const [modulesRender, setModulesRender] = useState([]);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [phaseData, setPhaseData] = useState({});

  useEffect(() => {

    //sort based by order attribute. when fetching from server

    //temp
    _modules.forEach((obj, index) => {
      // console.log(obj, index)
      obj.order = index;
    })
    //!


    setModules(_modules)
  }, [])


  // useEffect(async() => {
  //
  //   console.log(_modules[0])
  //
  //   if(!_modules[0]) return
  //
  //   let result = await Request().client
  //     .phases.add('create')
  //     .post
  //     .json
  //     .body({
  //       name: 'a phase',
  //       parentModuleId: _modules[0].id
  //     })
  //     .result
  //
  //
  //   console.log(result)
  //
  //
  // }, [_modules])


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


  const movedModule = async(evt) => {

    //state has been updated for sortableList

    //update order on modules

    const newModulesArray = modules.slice();

    await sortableList.forEach((item, index) => {

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
              >

              {sortableList.map((obj, index) =>
                <EditableModule
                  sortableHasOneChosen={isAModuleChosen}
                  chosen={obj.chosen}
                  onPhaseClick={(phase) => phaseClick(phase, obj.id)}
                  removeSelected={(moduleContainSelectedPhase === obj.id) ? false : true}
                  key={obj.id}
                  name={obj.name}
                  _phases={obj.phases}
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
