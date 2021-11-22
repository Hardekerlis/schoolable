import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import {
  IconRenderer,
  RightArrow
} from 'helpers/systemIcons';

import {
  firstLetterToUpperCase
} from 'helpers';

import styles from './module.module.sass';

const Module = ({
  name,
  className,
  clickable,
  onPhaseClick,
  removeSelected,
  phases,
  queryPhase,
  phaseQueryHandledInModules
}) => {

  if(clickable !== false) clickable = true;

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [dropdownId, setDropdownId] = useState('module_dropdown_' + nanoid(6));
  const [wrapperId, setWrapperId] = useState('module_wrapper_' + nanoid(6));
  const [selected, setSelected] = useState(-1);

  //TODO: actually fetch the phase
  const [children, setChildren] = useState(phases);

  const [renders, setRenders] = useState([]);

  const [queryPhaseHandled, setQueryPhaseHandled] = useState(false);

  useEffect(() => {

    if(!phaseQueryHandledInModules) return;

    if(queryPhaseHandled) return;
    setQueryPhaseHandled(true);

    if(queryPhase === false) return;

    setIsOpen(true);

    phaseClicked(children[queryPhase], queryPhase)

  }, [queryPhase])


  const phaseClicked = (obj, index) => {

    if(index === selected) {
      //unselected
      setSelected(-1);
      onPhaseClick(-1);
      return
    }

    setSelected(index);

    onPhaseClick(obj)

  }

  useEffect(() => {

    if(removeSelected && selected !== -1) {
      setSelected(-1);
    }

  }, [removeSelected]);

  useEffect(() => {

    setRenders(children.map((obj, index) => {
      return (
        <div onClick={() => phaseClicked(obj, index)} className={(index === selected) ? `${styles.child} ${styles.selected}` : styles.child} key={index}>
          <div className={styles.treeLinker}></div>
          <p>{firstLetterToUpperCase(obj?.name)}</p>
        </div>
      )
    }))

    //height of dropdown child = 60
    //height: 80
    //margin: 16
    //=96
    setDropdownHeight((children.length * 96))

  }, [children, selected])

  const onModuleClick = () => {
    if(!clickable) return;

    setIsOpen(!isOpen);
  };

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(isOpen) containerClassName += ` ${styles.open}`;


  if(!clickable) containerClassName += ` ${styles.nonClickable}`;

  return (
    <>
      <div id={wrapperId} className={containerClassName}>
        <div onClick={onModuleClick} className={styles.textContainer}>
          <div className={styles.iconContainer}>
            <IconRenderer
              icon={RightArrow}
              className={styles.icon}
            />
          </div>
          <p className={styles.name}>{name}</p>
        </div>
        <div id={dropdownId} className={(isOpen) ? `${styles.dropdown} ${styles.open}` : styles.dropdown}>
          <div className={styles.tree}></div>
          {renders}
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
    </>
  );
};


export default Module;
