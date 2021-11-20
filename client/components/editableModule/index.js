import React, { useEffect, useState } from 'react';

import { ReactSortable, Sortable, MultiDrag, Swap } from "react-sortablejs";


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
  Request
} from 'helpers';


import styles from './editableModule.module.sass';

const EditableModule = ({
  index,
  name,
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
  dataIndex
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
    // return;
    console.log("module clicked")
    setIsOpen(!isOpen);
  };

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(isOpen) containerClassName += ` ${styles.open} _this_module_open`;


  if(chosen) containerClassName += ` ${styles.chosen}`;

  if(sortableHasOneChosen) containerClassName += ` ${styles.parentHasOneChosen}`


  const dragIconClick = () => {
    if(isOpen) setIsOpen(false);
  }

  const dragIconPhaseClick = (phaseId) => {

    if(phaseId === selected) {
      console.log("gpieajg")
      setSelected(-1);
      onPhaseClick(-1);
    }

  }

  const createPhaseClicked = () => {
    console.log("create")
  }


  useEffect(() => {

    if(!children) return;

    //+96 for the static create phase child
    setDropdownHeight((children.length * 96) + 96)

  }, [children])

  useEffect(() => {

    let arr = [];

    for(let phase of phases) {

      //this should be .id not ._id
      //not the client's fault though
      arr.push({
        id: phase._id,
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
        <div className={styles.tree}></div>

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
          onClick={() => createPhaseClicked()}
        >
          <div className={styles.treeLinker}></div>
          <p>Create phase</p>
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
