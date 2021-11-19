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
  firstLetterToUpperCase
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
  _phases
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

    console.log("selecting")

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
    setIsOpen(!isOpen);
  };

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(isOpen) containerClassName += ` ${styles.open}`;


  if(chosen) containerClassName += ` ${styles.chosen}`;

  if(sortableHasOneChosen) containerClassName += ` ${styles.parentHasOneChosen}`


  const dragIconClick = () => {
    if(isOpen) setIsOpen(false);
  }

  useEffect(() => {

    if(!children) return;

    if(children.length === 0) {
      //will render a child with 96px if no children was found
      setDropdownHeight(96)
    }else {
      setDropdownHeight((children.length * 96))
    }

    let missing = {
      name: 'Missing children',
      id: 'noChildren',
      filter: true
    }


    if(children.length === 0) {
      //add no children child

      setChildren([
        missing
      ])

      console.log("set missing")

    }else {
      //remove no children child

      //DOESNT WORK

      if(children[0].id === 'noChildren') {

        if(children.length === 1) return;

        let arr = children.slice();
        arr.shift();
        setChildren(arr);
      }

    }


  }, [children])



  useEffect(() => {

    setChildren(phases.map((obj) => {

      //MIGHT RE-WRITE

      return {
        id: obj.id,
        name: obj.name,
        page: obj.page
      }

    }))

  }, [phases, selected])

  // onClick={() => phaseClicked(obj, index)}
  //className={(index === selected) ? `${styles.child} ${styles.selected}` : styles.child}

  return (
    <div id={wrapperId} className={containerClassName}>
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
          list={children}
          setList={setChildren}
        >


          {children.map(item => {

            let className = styles.child;
            if(item.id === selected) className += ` ${styles.selected}`

            return(
              <div
                className={(item.filter) ? `filtered ${className}` : className}
                key={item.id}
                onClick={() => phaseClicked(item)}
              >
                <div className={styles.treeLinker}></div>
                <p>{firstLetterToUpperCase(item?.name)}</p>
              </div>
            )
          })}

        </ReactSortable>

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
