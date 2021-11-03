import React, { useEffect, useState } from 'react';

// import Request from 'helpers/request.js';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IconRenderer, PlusCircle } from 'helpers/systemIcons';

import language from 'helpers/lang';
const lang = language.sampleCreationSystem;

// import { lowerFirstLetter } from 'helpers/misc.js';

import {
  DepRequest as Request,
  lowerFirstLetter
} from 'helpers';

import { Loader } from 'components'

import styles from './sampleCreationSystem.module.sass';

const SampleCreationSystem = ({
  body,
  createItemButtonClassName,
  creationContainerClassName,
  firstWrapperClassName,
  requestCallback,
  currentItems,
  itemApiPath,
  itemName,
  noCurrentItemText,
  createAdditionalItemIcon
}) => {
  let itemCreationRef = React.useRef();

  let [newItemCreation, setNewItemCreation] = useState(false);
  let [newItemName, setNewItemName] = useState('');

  let [loaderActive, setLoaderActive] = useState(false);

  const openNewItemCreation = () => {
    setNewItemCreation(true);
  };

  const closeItemCreation = () => {
    setNewItemCreation(false);
  };

  useEffect(() => {
    if(newItemCreation) {
      itemCreationRef.current?.classList.add(`${styles.creationOpen}`);
    }else {
      itemCreationRef.current?.classList.remove(`${styles.creationOpen}`);
    }
  }, [newItemCreation]);

  const newItemNameChange = evt => {
    setNewItemName(evt.target.value);
  };

  let [isCreatingItem, setIsCreatingItem] = useState(false);

  const itemCreationSubmit = async evt => {
    evt.preventDefault();

    if(isCreatingItem) return;

    setIsCreatingItem(true);
    setLoaderActive(true);

    let reqBody = {
      name: newItemName,
    };

    if(body) reqBody = Object.assign(reqBody, body);

    let request = new Request(itemApiPath, reqBody).post().json();

    let response = await request.send();

    setLoaderActive(false)

    //send response to caller

    const isError = !requestCallback(response);

    if(!isError) {
      setNewItemName('');
      setNewItemCreation(false);
    }

    setIsCreatingItem(false);
  };

  const _firstWrapperClassName = firstWrapperClassName
    ? `${styles.createFirstItemWrapper} ${firstWrapperClassName}`
    : styles.createFirstItemWrapper;
  const _creationContainerClassName = creationContainerClassName
    ? `${styles.newItemCreation} ${creationContainerClassName}`
    : styles.newItemCreation;
  const _createItemButtonClassName = createItemButtonClassName
    ? `${styles.createItem} ${createItemButtonClassName}`
    : styles.createItem;
    
  if(!currentItems) currentItems = [];

  return (
    <>
      <Loader active={loaderActive} />
      {currentItems.length === 0 ? (
        <>
          <div className={_firstWrapperClassName}>
            <div
              onClick={openNewItemCreation}
              className={styles.createFirstItem}
            >
              <FontAwesomeIcon className={styles.plus} icon={faPlus} />
              <p>Create {lowerFirstLetter(itemName)}</p>
            </div>
            <p className={styles.helperText}>
              {noCurrentItemText}
              <br /> {lang.noCurrentItems}
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            onClick={openNewItemCreation}
            className={_createItemButtonClassName}
          >
            <IconRenderer onHover={{
              text: `${lang.create} ${lowerFirstLetter(itemName)}`,
              direction: 'right'
            }} className={styles.plus} icon={(createAdditionalItemIcon) ? createAdditionalItemIcon : PlusCircle} />
          </div>
        </>
      )}

      <div ref={itemCreationRef} className={_creationContainerClassName}>
        <form onSubmit={itemCreationSubmit}>
          <input
            onChange={newItemNameChange}
            value={newItemName}
            autoFocus
            placeholder={`${itemName} ${lang.itemNameSuffix}`}
          />
          <div className={styles.buttonContainer}>
            <button type='button' onClick={closeItemCreation}>
              {lang.exit}
            </button>
            <button type='submit'>{lang.create}</button>
          </div>
        </form>
      </div>
    </>
  );
};

//small create box with text:
// <div
//   onClick={openNewItemCreation}
//   className={_createItemButtonClassName}
// >
//   <IconRenderer className={styles.plus} icon={PlusCircle} />
//   <p>
//     {lang.create} {lowerFirstLetter(itemName)}
//   </p>
// </div>




export default SampleCreationSystem;
