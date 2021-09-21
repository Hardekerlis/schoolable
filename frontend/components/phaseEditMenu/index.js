import React, { useEffect, useState } from 'react';

import { Phase } from 'components'

import Request from 'helpers/request.js'

import styles from './phaseEditMenu.module.sass';

const PhaseEditMenu = ({ info, courseId, nameChanged, closeMenu }) => {

  let [phaseName, setPhaseName] = useState(info.name);
  let [changesSaved, setChangesSaved] = useState(true);

  let wrapperRef = React.useRef();

  useEffect(() => {

    wrapperRef.current.classList.add(styles.open);

  }, [info])

  const exitMenu = () => {
    wrapperRef.current.classList.remove(styles.open);
    setTimeout(() => {
      closeMenu();
    }, 200)
  }


  const onNameChange = (evt) => {

    setPhaseName(evt.target.value);

    nameChanged(evt.target.value, info.index)

    updateTitleOnServer(evt.target.value);

  }

  let phaseChanges = 0;

  const handlePhaseChanges = (num) => {

    phaseChanges += num;

    if(phaseChanges !== 0) {
      setChangesSaved(false);
    }else if(phaseChanges === 0) {
      setChangesSaved(true);
    }

  }

  const updateTitleOnServer = async(value) => {

    handlePhaseChanges(1);

    let req = new Request(`/api/course/${courseId}/${info.id}`, {
      name: value
    }).json().put();
    let res = await req.send();

    handlePhaseChanges(-1);

  }

  return(
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.container}>
        <Phase className={styles.showcase} clickable={false} editing={false} id={info.id} name={phaseName} />
        <div className={styles.nameContainer}>
          <p className={styles.phaseNameText}>Edit phase name</p>
          <input placeholder="Phase name" value={phaseName} onChange={onNameChange} />
        </div>

        <div className={styles.changesSaveStatus}>

          { changesSaved ?

            <p>Changes saved.</p>

            :

            <p>Saving changes...</p>


          }

        </div>

        <button onClick={exitMenu}>Exit</button>

      </div>
    </div>
  )

}

export default PhaseEditMenu;
