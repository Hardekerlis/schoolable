import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import {
  faPenSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  IconRenderer,
  LightEdit,
  Document,
  RightArrow
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
  removeSelected
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [dropdownId, setDropdownId] = useState('module_dropdown_' + nanoid(6));
  const [wrapperId, setWrapperId] = useState('module_wrapper_' + nanoid(6));
  const [selected, setSelected] = useState(-1);

  const [children, setChildren] = useState([
    {
      name: 'hej',
      page: {
        handInTypes: ['file', 'text', 'googleDrive'],
        paragraphs: [
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          }
        ],
        comments: {
          enabled: true,
          posts: [
            {
              name: 'Swagger sund',
              text: 'my comment',
              createdAt: new Date()
            },
            {
              name: 'Swagger sund v2',
              text: ' my comment my comment my comment my comment my comment my comment my comment my comment my comment',
              createdAt: new Date()
            }
          ]
        }
      }
    },
    {
      name: 'wazzz',
      page: {
        handInTypes: ['file', 'text', 'googleDrive'],
        paragraphs: [
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          },
        ],
        comments: {
          enabled: false,
        }
      }
    },
    {
      name: 'wzzup1'
    },
    {
      name: 'wzzup2'
    }
  ])

  const [renders, setRenders] = useState([]);

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
    setIsOpen(!isOpen);
  };

  let containerClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  if(isOpen) containerClassName += ` ${styles.open}`;

  const editableClick = () => {
    //open edit menu

    console.log("clicked an editable module")
  };

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

  return (
    <div className={styles.moduleEditWrapper}>

      <div onClick={editableClick} className={styles.moduleEdit}>
        <div className={styles.iconContainer}>
          <IconRenderer
            icon={LightEdit}
            className={styles.icon}
          />
        </div>
        <p className={styles.name}>{name}</p>
        <div className={styles.editBtn}>
          <p>Edit</p>
        </div>
      </div>

    </div>
  );

}

export default EditableModule;
