import React, { useEffect, useState } from 'react';

import {
  firstLetterToUpperCase
} from 'helpers';

import styles from './phaseItemEditing.module.sass';

const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const Input = ({what, onChange, value, index}) => {

  const wrapperRef = React.useRef();

  const focusInput = (evt) => {
    if(evt.target.tagName !== 'INPUT') {
      evt.target.children[0].children[1].focus()
    }
  }

  const [width, setWidth] = useState("100px");

  const setWidthToTextSize = () => {
    let elem = document.createElement('p');
    elem.style = `
      font-size: 2rem;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      width: auto;
      display: inline-block;
    `;

    elem.textContent = value;

    document.body.appendChild(elem);

    const containerWidth = wrapperRef.current.getBoundingClientRect().width;

    //20 = 20px padding-right on inner
    //10 = 10px margin-left on input
    const textWidth = wrapperRef.current.children[0].children[0].getBoundingClientRect().width + 20 + 10;

    //30 = 10px padding-left & 20px padding-right on input
    let w = elem.getBoundingClientRect().width + 30;

    if((textWidth + w) >= containerWidth) {
      w = containerWidth - textWidth;
    }

    setWidth(w + "px");

    elem.remove();
  }

  useEffect(() => {
    setWidthToTextSize();
  }, [index])

  const onFocus = (evt) => {
    const containerWidth = wrapperRef.current.getBoundingClientRect().width;
    //20 = 20px padding-right on inner
    //10 = 10px margin-left on input
    const textWidth = wrapperRef.current.children[0].children[0].getBoundingClientRect().width + 20 + 10;

    let wid = containerWidth - textWidth;

    setWidth(wid + "px");
  }

  const onBlur = () => {
    setWidthToTextSize();
  }

  return(
    <div ref={wrapperRef} onClick={focusInput} className={styles.inputContainer}>
      <div className={styles.inner}>
        <p>{what}</p>
        <input onFocus={onFocus} onBlur={onBlur} style={{
          width: width
        }} onChange={onChange} value={value} />
      </div>
    </div>
  )
}


const PhaseItemEditing = ({ item, index }) => {

  const prevIndex = usePrevious(index);

  const [data, setData] = useState({
    name: item.name,
    paragraphs: item.paragraphs
  })

  const [myIndex, setMyIndex] = useState(index);

  useEffect(() => {
    if(index !== prevIndex) {
      setData(item)
      setMyIndex(index);
    }

  }, [index])

  const nameChanged = (evt) => {
    setData({
      ...data,
      name: evt.target.value
    })
  }

  //html, images, text, uploads

  //upload url api/files/upload

  //image
  //upload an image -> returns an url
  //use url in image tag
  //in iframe

  return(
    <div className={styles.wrapper}>
      <form>
        <Input what="Title" onChange={nameChanged} value={firstLetterToUpperCase(data.name)} index={myIndex} />
      </form>
    </div>
  )

}

export default PhaseItemEditing;
