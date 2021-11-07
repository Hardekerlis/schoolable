import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import {
  IconRenderer,
  Document
} from 'helpers/systemIcons';

import styles from './module.module.sass';

const Module = ({
  name,
  id,
  className,
  clickable,
  phases
}) => {

  if(clickable !== false) clickable = true;

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [dropdownId, setDropdownId] = useState('module_dropdown_' + nanoid(6));


  const children = [
    {
      name: 'hej'
    },
    {
      name: 'wzzup'
    },
    {
      name: 'wzzup1'
    },
    {
      name: 'wzzup2'
    }
  ]

  const [renders, setRenders] = useState([]);

  useEffect(() => {

    setRenders(children.map((obj, index) => {
      return (
        <div className={styles.child} key={index}>
          <p>{obj.name}</p>
        </div>
      )
    }))

    //height of dropdown child = 60
    setDropdownHeight(children.length * 80)

  }, [])

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
      <div onClick={onModuleClick} className={containerClassName}>
        <div className={styles.textContainer}>
          <div className={styles.iconContainer}>
            <IconRenderer
              icon={Document}
              className={styles.icon}
            />
          </div>
          <p className={styles.name}>{name}</p>
        </div>
        <div id={dropdownId} className={(isOpen) ? `${styles.dropdown} ${styles.open}` : styles.dropdown}>
          {renders}
        </div>
      </div>

      <style>
      {`
        #${dropdownId}.${styles.open} {
          height: ${dropdownHeight}px
        }
      `}
      </style>
    </>
  );
};


export default Module;
