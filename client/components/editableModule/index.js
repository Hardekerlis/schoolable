import React, { useEffect, useState } from 'react';

import { ReactSortable, Sortable } from "react-sortablejs";


import { nanoid } from 'nanoid';

import {
  faPenSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  IconRenderer,
  LightEdit,
  Document,
  RightArrow,
  Drag
} from 'helpers/systemIcons';

import {
  firstLetterToUpperCase,
  Request,
  Prompt,
} from 'helpers';

import {
  Loader
} from 'components'


import styles from './editableModule.module.sass';

const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const EditableModule = ({
  index,
  name,
  moduleId,
  className,
  onPhaseClick,
  removeSelected,
  chosen,
  sortableHasOneChosen,
  _phases,
  onPhaseChosen,
  fetchChosenPhase,
  onPhaseMove,
  setDraggingPhase,
  dataIndex,
  queryPhase,
  phasePageOpen
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [dropdownId, setDropdownId] = useState('module_dropdown_' + nanoid(6));
  const [wrapperId, setWrapperId] = useState('module_wrapper_' + nanoid(6));

  //should be id based instead.
  const [selected, setSelected] = useState(-1);


  const [phases, setPhases] = useState(_phases);

  const [children, setChildren] = useState([]);

  const [renders, setRenders] = useState([]);

  const [queryPhaseHandled, setQueryPhaseHandled] = useState(false);

  useEffect(() => {

    if(queryPhaseHandled) return;
    setQueryPhaseHandled(true);

    if(queryPhase === false) return;

    setIsOpen(true);

    phaseClicked(phases[queryPhase], queryPhase)

  }, [queryPhase])

  const phaseClicked = (obj, index) => {

    if(obj.id === selected) {
      //unselected
      setSelected(-1);
      onPhaseClick(-1);
      return
    }

    setSelected(obj.id);

    onPhaseClick(obj)

  }

  useEffect(() => {

    if(removeSelected && selected !== -1) {
      setSelected(-1);
    }

  }, [removeSelected]);

  const onModuleClick = () => {
    setIsOpen(!isOpen);
  };

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(isOpen) containerClassName += ` ${styles.open} _this_module_open`;


  if(chosen) containerClassName += ` ${styles.chosen}`;

  if(sortableHasOneChosen) containerClassName += ` ${styles.parentHasOneChosen}`;

  const dragIconClick = () => {
    if(isOpen) setIsOpen(false);
  }

  const dragIconPhaseClick = (phaseId) => {

    if(phaseId === selected) {
      setSelected(-1);
      onPhaseClick(-1);
    }

  }


  const [createPhaseOpen, setCreatePhaseOpen] = useState(false);
  const [createMenuLoaderActive, setCreateMenuLoaderActive] = useState(false);

  if(createPhaseOpen) containerClassName += ` ${styles.creatingPhase}`

  const createPhaseClicked = () => {
    //display create menu
    setCreatePhaseOpen(!createPhaseOpen)
  }

  const [newPhaseName, setNewPhaseName] = useState('');

  const createPhaseSubmit = async(evt) => {
    evt.preventDefault();

    //TODO: proper name validation
    if(newPhaseName.length === 0) {
      Prompt.error("Please enter a valid phase name.")
      return;
    }

    setCreateMenuLoaderActive(true);

    let result = await Request().client
      .phases.add('create')
      .post
      .json
      .body({
        name: newPhaseName,
        parentModuleId: moduleId
      })
      .result

    setCreateMenuLoaderActive(false);

    if(result.data.errors === false) {
      //phase created.
      Prompt.success('Phase created!');

      //add phase.
      let newPhase = result.data.phase;
      newPhase.order = phases.length;

      let newPhases = phases.slice();
      newPhases.push(newPhase);

      setPhases(newPhases);

      setNewPhaseName('');

    }else {
      Prompt.error(result.data.errors);
    }

  }

  const [treeMaxHeight, setTreeMaxHeight] = useState(0);

  useEffect(() => {

    if(!children) return;

    //+96 for the static create phase child

    let newHeight = (children.length * 96) + 96;

    let newTreeMaxHeight = newHeight - 39;

    //120 = createMenu height
    if(createPhaseOpen) newHeight += 160;

    setTreeMaxHeight(newTreeMaxHeight);
    setDropdownHeight(newHeight)

  }, [children, createPhaseOpen])

  useEffect(() => {

    let arr = [];

    for(let phase of phases) {
      //this should be .id not ._id
      //not the client's fault though
      arr.push({
        id: phase.id,
        name: phase.name,
        order: phase.order,
        page: (phase.page) ? phase.page : null
      })

    }

    setChildren(arr);

  }, [phases, selected])

  const onLocalPhaseUpdate = (evt) => {

    //this will not run if the phase has switched module
    //the phase has been re-ordered within the module

    //it will run on the list which the phase was removed from.

    //update order on phases

    const newPhasesArray = phases.slice();

    children.forEach((item, index) => {

      newPhasesArray[item.order].order = index;
      item.order = index;

    })

    //call sort because phases will be updated
    newPhasesArray.sort((obj1, obj2) => {
      return obj1.order - obj2.order;
    })

    setPhases(newPhasesArray)

  }

  const [addedPhase, setAddedPhase] = useState(null);

  useEffect(() => {

    if(addedPhase === null) return;

    const newPhasesArray = phases.slice();

    //children has been updated with the new phase
    //children only includes data for render
    //so there's no way of knowing the added phase's full data.
    //save the data to modules
    //call a function the fetch that data from here.
    //sounds like a good time.

    let newAddedPhase = fetchChosenPhase();
    newAddedPhase.order = addedPhase;

    newPhasesArray.push(newAddedPhase);
    children[addedPhase].order = addedPhase;

    children.forEach((item, index) => {

      newPhasesArray[item.order].order = index;
      item.order = index;

    })

    //call sort because phases will be updated
    newPhasesArray.sort((obj1, obj2) => {
      return obj1.order - obj2.order;
    })

    setPhases(newPhasesArray);

    setAddedPhase(null)

  }, [children])

  const phaseChosen = (evt) => {

    //dispatch the chosen phase to modules
    //to be gathered by another module if the phase switches modules.
    onPhaseChosen(phases[evt.oldIndex])
    setDraggingPhase(true);

  }

  const phaseUnChosen = () => {
    setDraggingPhase(false);
  }

  const onAddPhaseToModule = (evt) => {
    //a new phase has been added
    //this runs before children state has been updated
    //which means that a useEffect has to listen to children updates
    //and check the addedPhase state.
    //and then handle the new added phase.

    setAddedPhase(evt.newIndex);
  }

  const removedPhaseFromModule = (evt) => {

    let newPhasesArray = phases.slice();

    newPhasesArray.splice(evt.oldIndex, 1);

    newPhasesArray.forEach((item, i) => {
      item.order = i;
    });

    //TODO: might be unnecessary
    //call sort because phases will be updated
    newPhasesArray.sort((obj1, obj2) => {
      return obj1.order - obj2.order;
    })

    setPhases(newPhasesArray);

    //WILL CALL ONLOCALPHASEUPDATE AS WELL
    //a whole lot of this code might be unnecessary

  }

  if(phasePageOpen) containerClassName += ` ${styles.phasePageOpen}`

  return (
    <div data-index={dataIndex} id={wrapperId} className={containerClassName}>
      <div onClick={onModuleClick} className={styles.textContainer}>
        <div onMouseDown={dragIconClick} className={`${styles.dragIcon} sortable_draggable`}>
          <IconRenderer
            icon={Drag}
            className={styles.icon}
          />
        </div>
        <div className={styles.iconContainer}>
          <IconRenderer
            icon={RightArrow}
            className={styles.icon}
          />
        </div>
        <p style={{pointerEvents: 'none'}} className={styles.name}>{name}</p>
      </div>
      <div id={dropdownId} className={(isOpen) ? `${styles.dropdown} ${styles.open}` : styles.dropdown}>
        <div style={{maxHeight: `${treeMaxHeight}px`}} className={styles.tree}></div>

        <ReactSortable
          group={{
            name: 'nested',
            pull: ['nested'],
            put: ['nested'],
          }}
          animation={200}
          swapThreshold={0.65}
          fallbackOnBody
          filter={'.filtered'}
          handle={'.sortable_draggable_phase'}
          list={children}
          setList={setChildren}
          onEnd={onLocalPhaseUpdate}
          onRemove={removedPhaseFromModule}
          onAdd={onAddPhaseToModule}
          onChoose={phaseChosen}
          onUnchoose={phaseUnChosen}
          forceFallback={true}
          onMove={onPhaseMove}
          fallbackClass={styles.childDragging}
        >


          {children.map(phase => {

            let className = styles.child;
            if(phase.id === selected) className += ` ${styles.selected}`;
            if(phase.chosen) className += ` ${styles.chosen}`

            return(
              <div
                className={(phase.filter) ? `filtered ${className}` : className}
                key={phase.id}
                onClick={() => phaseClicked(phase)}
              >
                <div className={styles.treeLinker}></div>
                { !phase.filter &&
                  <div onMouseDown={() => dragIconPhaseClick(phase.id)} className={`${styles.dragIconPhase} sortable_draggable_phase`}>
                    <IconRenderer
                      icon={Drag}
                      className={styles.icon}
                    />
                  </div>
                }
                <p>{firstLetterToUpperCase(phase?.name)}</p>
              </div>
            )
          })}

        </ReactSortable>

        <div
          className={`${styles.child} ${styles.createPhase}`}
          key={'createPhase'}
        >
          <div className={styles.treeLinker}></div>
          <div onClick={() => createPhaseClicked()} className={styles.inner}>
            <p>{(createPhaseOpen) ? 'Cancel phase creation' : 'Create a new phase'}</p>
          </div>
          <div className={(createPhaseOpen) ? `${styles.createMenu} ${styles.createMenuOpen}` : styles.createMenu}>
            <Loader active={createMenuLoaderActive} />
            <div className={styles.menuLinker}></div>
            <p className={styles.title}>New phase creation</p>
            <form onSubmit={createPhaseSubmit}>
              <input placeholder="Phase name" value={newPhaseName} onChange={(evt) => setNewPhaseName(evt.target.value)} />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>

      </div>
      <style>
      {`
        #${dropdownId}.${styles.open} {
          height: ${dropdownHeight}px
        }

        #${wrapperId}.${styles.open} {
          height: ${dropdownHeight + 80}px
        }

      `}
      </style>
    </div>
  );

}

export default EditableModule;
