import React, { useEffect, useState } from 'react';

import language from 'helpers/lang';
const lang = language.coursePageEdit.modules;

import {
  PlusClipboard
} from 'helpers/systemIcons'

import {
  EditableModule,
  SampleCreationSystem,
} from 'components';

import {
  Prompt
} from 'helpers';

import styles from './modules.module.sass';

const Modules = ({ _modules, course, setLoaderActive }) => {

  console.log(_modules)

  if(!_modules) _modules = [];

  const [modules, setModules] = useState(_modules);
  const [modulesRender, setModulesRender] = useState();
  const [phaseOpen, setPhaseOpen] = useState(false);

  useEffect(() => {
    setModulesRender(
      modules.map((obj, index) => {

        console.log(obj)

        return (
          <EditableModule fullWidth={!phaseOpen} key={index} id={obj.id} name={obj.name} phases={obj.phases} />
        );
      }),
    );
  }, [modules]);

  const onModuleCreation = async response => {
    // console.log(response);

    if(response.errors === false) {
      let arr = modules.slice();

      arr.push(response.module);

      setModules(arr);

      Prompt.success(lang.moduleCreated);
      return true;
    }else {
      Prompt.error(response.errors);
      return false;
    }

    //return false for error.
  };

  console.log(course.id)

  return(
    <div className={styles.wrapper}>
      {modulesRender?.length === 0 ? (
        <p className={styles.noModulesText}>{lang.noModulesText}</p>
      ) : (
        <>
          <p className={styles.modulesText}>{lang.modules}</p>

          <div className={styles.modulesContainer}>
            {modulesRender}
          </div>
        </>
      )}
      <SampleCreationSystem
        creationContainerClassName={styles.creationContainer}
        body={{
          parentCourseId: course.id,
        }}
        createItemButtonClassName={styles.createModuleButton}
        requestCallback={onModuleCreation}
        itemApiPath={`/api/modules/create`}
        currentItems={modules}
        itemName={lang.moduleItemName}
        noCurrentItemText={lang.courseMissingModules}
        createAdditionalItemIcon={PlusClipboard}
      />
    </div>
  )

}

export default Modules;
