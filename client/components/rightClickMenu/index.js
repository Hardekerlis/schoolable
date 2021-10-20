import React, { useEffect, useState } from 'react';

import styles from './rightClickMenu.module.sass';

const RightClickMenu = () => {
  const options = [
    {
      name: 'Click A',
    },
    {
      name: 'Click B',
    },
  ];

  const renderers = options.map((obj, index) => {
    return (
      <div key={index} className={styles.option}>
        <p>{obj.name}</p>
      </div>
    );
  });

  return <div className={styles.wrapper}>{renderers}</div>;
};

export default RightClickMenu;
