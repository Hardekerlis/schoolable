import React, { useEffect, useState } from 'react';

import styles from './creator.module.sass';

const ParagraphCreator = ({  }) => {

  const [isCreating, setIsCreating] = useState(false);

  const beginCreation = () => {
    setIsCreating(true);
  }

  const types = [
    {
      name: 'Text',
      value: 'text'
    },
    {
      name: 'Image',
      value: 'image'
    },
    {
      name: 'File',
      value: 'file'
    },
    {
      name: 'Video',
      value: 'video'
    }
  ]

  return (
    <div className={styles.wrapper}>
      { isCreating &&
        <div className={styles.create}>
          <p className={styles.title}>New paragraph</p>

          <div className={styles.types}>
            {selectorRenders}
          </div>


        </div>
      }
      <div onClick={beginCreation} className={styles.begin}>
        <p className={styles.title}>Create new paragraph</p>
      </div>
    </div>
  )

}

export default ParagraphCreator;
