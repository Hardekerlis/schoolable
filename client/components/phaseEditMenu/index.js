import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';


import { Phase } from 'components'

import Request from 'helpers/request.js'

import { faPenSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import language from 'helpers/lang';
const lang = language.phaseEditMenu;

import styles from './phaseEditMenu.module.sass';

const PhaseEditMenu = ({ info, courseId, nameChanged, closeMenu }) => {

  const router = useRouter();

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

  const goToPhasePageEdit = () => {
    //go to phase edit page
    // router.push()
  }

  return(
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.container}>
        <Phase className={styles.showcase} clickable={false} editing={false} id={info.id} name={phaseName} />
        <div className={styles.nameContainer}>
          <p className={styles.phaseNameText}>{lang.phaseNameText}</p>
          <input placeholder={lang.phaseNameInputPlaceholder} value={phaseName} onChange={onNameChange} />
        </div>

        <div className={styles.changesSaveStatus}>

          { changesSaved ?

            <p>{lang.changesSaved}</p>

            :

            <p>{lang.savingChanges}</p>


          }

        </div>

        <div className={styles.toolbar}>
          <ToolbarOption title={lang.editPhasePage} icon={faPenSquare} action={goToPhasePageEdit} />
        </div>

        <button onClick={exitMenu}>{lang.exit}</button>

      </div>
    </div>
  )

}

const ToolbarOption = ({ action, icon, title }) => {

  return (
    <div onClick={action} className={styles.option}>
      <FontAwesomeIcon icon={icon} className={styles.icon} />
      <p>{title}</p>
    </div>
  )

}

export default PhaseEditMenu;