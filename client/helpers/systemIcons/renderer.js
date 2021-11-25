import React, { useState, useEffect } from 'react';

import { nanoid } from 'nanoid';

import {
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import styles from './renderer.module.sass'

const IconRenderer = ({ onHover, className, icon, onClick, selectClass }) => {

  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [hoverElementWidth, setHoverElementWidth] = useState(0);
  const [hoverId, setHoverId] = useState();
  const [hoverClass, setHoverClass] = useState(styles.select)

  useEffect(() => {

    if(typeof window === 'undefined') return;

    if(onHover) {

      //calculate actual width of text on page

      let elem = document.createElement('p');
      elem.style = `
        font-size: 1.4rem;
        pointer-events: none;
        user-select: none;
        opacity: 0;
        width: auto;
        display: inline-block;
      `;
      elem.textContent = onHover.text;

      document.body.appendChild(elem);

      //30 = 30px = 15px padding on both sides
      let hoverElemWidth = elem.getBoundingClientRect().width + 30;

      setHoverId('icon_renderer_arrow_' + nanoid(8))

      setHoverElementWidth(hoverElemWidth);

      elem.remove()

      if(onHover.direction === 'left') {

        setHoverClass(`${styles.select} ${styles.left}`)

      }

      setHoverEnabled(true);

    }


  }, [onHover])


  const _className = (className) ? `${styles.icon} ${className}` : styles.icon;

  return (
    <div onClick={onClick} className={_className}>
      {icon}
      { hoverEnabled &&
        <>
          <div id={hoverId} className={`${hoverClass} ${selectClass}`}>
            <FontAwesomeIcon className={styles.arrow} icon={faCaretLeft} />
            <p>{onHover.text}</p>
          </div>
          <style>
            {`

              .${styles.icon}:hover #${hoverId} {
                width: ${hoverElementWidth}px
              }

            `}
          </style>
        </>
      }
    </div>
  )

}

export default IconRenderer;
