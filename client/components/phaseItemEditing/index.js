import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import {
  firstLetterToUpperCase,
  IconRenderer
} from 'helpers';

import {
  PlusCircleRound,
  Checkbox,
  CheckboxChecked
} from 'helpers/systemIcons';

import language from 'helpers/lang';
const lang = language.phaseItemEditing;

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

const Paragraph = ({}) => {

  const [typeRenders, setTypeRenders] = useState([]);

  const [selectedType, setSelectedType] = useState(0);

  const [types, setTypes] = useState([
    {
      //should be able to edit text in html
      name: 'Text',
      value: 'text',
      enabled: true
    },
    {
      name: 'Image',
      value: 'image',
      enabled: false
    },
    {
      name: 'File upload',
      value: 'file_upload',
      enabled: false
    }
  ]);

  const setType = (index) => {
    let ts = types.slice();
    ts[selectedType].enabled = false;
    ts[index].enabled = true;
    setTypes(ts);
    setSelectedType(index);
  }

  useEffect(() => {

    setTypeRenders(types.map((obj, index) => {

      return (
        <div onClick={() => setType(index)} key={index} className={styles.selector}>
          <p className={styles.title}>{obj.name}</p>
          <div className={styles.enabler}><IconRenderer className={styles.box} icon={(obj.enabled) ? CheckboxChecked : Checkbox} /></div>
        </div>
      )

    }))

  }, [types])

  const RenderTypeContent = ({ type }) => {

    let render = (<div></div>);
    let title = 'Content';

    if(type === 'text') {
      title = 'Text'
      render = (
        <>
          <textarea className={styles.text}>

          </textarea>
        </>
      )
    }

    return (
      <div className={styles.content}>
        <p className={styles.headline}>{title}</p>
        {render}
      </div>
    )

  }

  return (
    <div className={styles.paragraph}>
      <p className={styles.headline}>Type of content:</p>
      <div className={styles.selectors}>{typeRenders}</div>

      <RenderTypeContent type={types[selectedType].value} />

    </div>
  )

}

const PhaseItemEditing = ({ item, index, itemUpdate }) => {

  const prevIndex = usePrevious(index);

  const [data, setData] = useState({
    name: item.name,
    paragraphs: item.paragraphs
  })

  const [myIndex, setMyIndex] = useState(index);

  const [newParagraphs, setNewParagraphs] = useState([]);


  useEffect(() => {
    if(index !== prevIndex) {
      setData(item)
      setMyIndex(index);

      setNewParagraphs([]);      
    }



  }, [index])

  const nameChanged = (evt) => {

    setData({
      ...data,
      name: evt.target.value
    })

    //update the name of to rendered item in the list.
    itemUpdate({
      ...data,
      name: evt.target.value
    });

  }

  //html, images, text, uploads

  //upload url api/files/upload

  //image
  //upload an image -> returns an url
  //use url in image tag
  //in iframe

  const onSubmit = (event) => {
    event.preventDefault();

    console.log("submitted");

  }


  const addContent = () => {
    let list = newParagraphs.slice();
    list.push(
      <Paragraph key={newParagraphs.length} />
    );
    setNewParagraphs(list);
  }

  return(
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit}>
        <Input what="Title" onChange={nameChanged} value={firstLetterToUpperCase(data.name)} index={myIndex} />
        <p className={styles.contentText}>{lang.contentText}</p>
        {newParagraphs}
        <div onClick={addContent} className={styles.addParagraph}>
          <IconRenderer icon={PlusCircleRound} />
          <p>Add a some content</p>
        </div>
      </form>
    </div>
  )

}

export default PhaseItemEditing;
