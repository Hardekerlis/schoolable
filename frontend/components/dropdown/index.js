import React, { useState, useEffect } from 'react';

import styles from './dropdown.module.sass';

import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const Dropdown = ({ onChange, defaultValue, options, height, className, currentClassName, arrowClassName, menuClassName, optionClassName }) => {

  const dropdownRef = React.useRef();

  const dropdownInitialHeight = (height) ? height : "80px";

  let [renderOptions, setRenderOptions] = useState([]);
  let [currentSelection, setCurrentSelection] = useState();

  useEffect(() => {

    setRenderOptions(options.map((obj, index) => {

      let text = (obj.name) ? obj.name : obj.value;

      let optionClick = (evt) => {
        setCurrentSelection(index);
      }

      return(
        <div onClick={optionClick} className={`${styles.option} ${optionClassName}`} key={index}>
          <p className={styles.text}>{text}</p>
        </div>
      )

    }))

    if(!defaultValue) setCurrentSelection(0);
    else {

      let match = -1;

      for(let i in options) {
        if(options[i].value === defaultValue) {
          match = i;
          break;
        }
      }

      if(match === -1) {
        console.warn(`No option has that value: ${defaultValue} (dropdown)`);
      }else {
        setCurrentSelection(match);
      }

    }

  }, [])

  const getCurrentName = () => {
    let obj = options[currentSelection];
    if(!obj) return '';
    return (obj.name) ? obj.name : obj.value;
  }

  let [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownClicked = () => {

    setDropdownOpen(!dropdownOpen)

  }

  useEffect(() => {

    if(dropdownOpen) {
      dropdownRef.current.classList.add(`${styles.open}`);
    }else {
      dropdownRef.current.classList.remove(`${styles.open}`);
    }

  }, [dropdownOpen])

  useEffect(() => {

    if(onChange && (currentSelection !== undefined && currentSelection !== null)) onChange(options[currentSelection]);

  }, [currentSelection])

  return (

    <div style={{height: dropdownInitialHeight}} ref={dropdownRef} onClick={dropdownClicked} className={`${styles.wrapper} ${className}`}>
      <p className={`${styles.current} ${currentClassName}`}>{getCurrentName()}</p>
      <div className={`${styles.arrow} ${arrowClassName}`}>
        <FontAwesomeIcon className={styles.icon} icon={faSortDown} />
      </div>
      <div style={{top: dropdownInitialHeight}} className={`${styles.actual} ${menuClassName}`}>
        {renderOptions}
      </div>
    </div>

  )

}


export default Dropdown;
