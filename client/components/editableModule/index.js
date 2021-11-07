import React, { useEffect, useState } from 'react';

import {
  faPenSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  IconRenderer,
  LightEdit,
  Document
} from 'helpers/systemIcons';

import styles from './editableModule.module.sass';

// const ModuleToolbarOption = ({ text, onClick, icon }) => {
//
//   return (
//     <div onClick={onClick} className={styles.option}>
//       <IconRenderer className={styles.icon} icon={icon} />
//       <p>{text}</p>
//     </div>
//   )
//
// }

const EditableModule = ({
  index,
  name,
  editing,
  id,
  className,
  clickable,
}) => {

  const editableClick = () => {
    //open edit menu

    console.log("clicked an editable phase")
  };

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

// <div className={styles.toolbar}>
//   <ModuleToolbarOption text={"Edit module page"} icon={LightEdit} onClick={goToModuleEdit} />
//   <ModuleToolbarOption text={"Go to module page"} icon={Document} onClick={goToModulePage} />
// </div>

export default EditableModule;
