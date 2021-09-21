import React, { useEffect, useState } from 'react';

import Request from 'helpers/request.js';


import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import language from 'helpers/lang';
const lang = language.sampleCreationSystem;

import { lowerFirstLetter } from 'helpers/misc.js';

import styles from './sampleCreationSystem.module.sass';



const SampleCreationSystem = ({ creationContainerClassName, firstWrapperClassName, requestCallback, currentItems, itemApiPath, itemName, noCurrentItemText }) => {

  let itemCreationRef = React.useRef();

  let [newItemCreation, setNewItemCreation] = useState(false);
  let [newItemName, setNewItemName] = useState('');


  const openNewItemCreation = () => {
    setNewItemCreation(true);
  }

  const closeItemCreation = () => {
    setNewItemCreation(false);
  }

  useEffect(() => {

    if(newItemCreation) {
      itemCreationRef.current?.classList.add(`${styles.creationOpen}`)
    }else {
      itemCreationRef.current?.classList.remove(`${styles.creationOpen}`)
    }

  }, [newItemCreation])

  const newItemNameChange = (evt) => {
    setNewItemName(evt.target.value);
  }


  let [isCreatingItem, setIsCreatingItem] = useState(false);

  const itemCreationSubmit = async(evt) => {

    evt.preventDefault();

    if(isCreatingItem) return;

    setIsCreatingItem(true);

    let request = new Request(itemApiPath, { name: newItemName }).post().json();
    let response = await request.send();

    //send response to caller

    const isError = !(requestCallback(response));

    if(!isError) {
      setNewItemName('');
      setNewItemCreation(false);
    }

    setIsCreatingItem(false);

  }

  const _firstWrapperClassName = (firstWrapperClassName) ? `${styles.createFirstItemWrapper} ${firstWrapperClassName}` : styles.createFirstItemWrapper;
  const _creationContainerClassName = (creationContainerClassName) ? `${styles.newItemCreation} ${creationContainerClassName}` : styles.newItemCreation;

  return (
    <>

      { currentItems.length === 0 ?
        <>

          <div className={_firstWrapperClassName}>

            <div onClick={openNewItemCreation} className={styles.createFirstItem}>
              <FontAwesomeIcon className={styles.plus} icon={faPlus} />
              <p>Create {lowerFirstLetter(itemName)}</p>
            </div>
            <p className={styles.helperText}>{noCurrentItemText}<br /> {lang.noCurrentItems}</p>

          </div>

        </>
        :
        <>

          <div onClick={openNewItemCreation} className={styles.createItem}>
            <FontAwesomeIcon className={styles.plus} icon={faPlus} />
            <p>{lang.create} {lowerFirstLetter(itemName)}</p>
          </div>

        </>
      }

      <div ref={itemCreationRef} className={_creationContainerClassName}>
        <form onSubmit={itemCreationSubmit}>
          <input onChange={newItemNameChange} value={newItemName} autoFocus placeholder={`${itemName} ${lang.itemNameSuffix}`} />
          <div className={styles.buttonContainer}>
            <button type="button" onClick={closeItemCreation}>{lang.exit}</button>
            <button type="submit">{lang.create}</button>
          </div>
        </form>
      </div>

    </>
  )

}

export default SampleCreationSystem;
