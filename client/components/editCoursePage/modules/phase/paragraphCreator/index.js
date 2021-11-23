import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import { ReactSortable, Sortable } from "react-sortablejs";

import {
  Checkbox,
  CheckboxChecked,
  Crossmark,
  Drag,
  Trash,
  LightEdit,
  RightArrow
} from 'helpers/systemIcons';

import {
  IconRenderer,
  Prompt
} from 'helpers';


import styles from './creator.module.sass';




const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const ParagraphCreator = ({ currentParagraphs }) => {

  const [selectedType, setSelectedType] = useState('text');
  const [types, setTypes] = useState([
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
  ])

  const [selectors, setSelectors] = useState([])

  const selectType = value => {
    setSelectedType(value);
  }

  useEffect(() => {

    setSelectors(types.map(item => {
      let selected = (selectedType === item.value);
      return (
        <div onClick={() => selectType(item.value)} key={item.value} className={(selected) ? `${styles.selector} ${styles.selected}` : styles.selector}>
          <IconRenderer
            icon={(selected) ? CheckboxChecked : Checkbox}
            className={styles.checkbox}
          />
          <p>{item.name}</p>
        </div>
      )
    }))

  }, [types, selectedType])

  const [paragraphs, setParagraphs] = useState([]);
  const [paragraphsRender, setParagraphsRender] = useState([]);

  useEffect(() => {

    setParagraphs(currentParagraphs)

  }, [currentParagraphs])

  useEffect(() => {

    if(!paragraphs) return;

    setParagraphsRender(paragraphs.map((obj, index) => {

      if(obj.type === 'text') {
        return (
          <div key={index} className={styles.paragraph}>
            <div className={styles.innerContainer}>
              <p className={styles.text}>{obj.text}</p>
            </div>
            <div className={styles.toolbar}>
              <div className={styles.dragIcon}>
                <IconRenderer
                  icon={Drag}
                  className={styles.icon}
                />
              </div>
              <div className={styles.trashIcon}>
                <IconRenderer
                  icon={Trash}
                  className={styles.icon}
                  selectClass={styles.select}
                  onHover={{
                    direction: 'left',
                    text: 'Delete'
                  }}
                />
              </div>
            </div>
          </div>
        )
      }

      console.log("unsupported paragraph type")

    }))

  }, [paragraphs]);


  const deleteParagraph = paragraph => {



  }

  const [paragraphText, setParagraphText] = useState('');

  const addParagraph = () => {

    let pData = {
      type: 'text', //shouldn't be hardcoded
      text: paragraphText,
      id: nanoid(6)
    }

    if(pData.text.length === 0) {
      return Prompt.error("Please write some text before adding paragraph.");
    }

    let arr = paragraphs.slice();
    arr.push(pData);
    setParagraphs(arr)


  }


  const [isEditing, setIsEditing] = useState(false);
  const prevIsEditing = usePrevious(isEditing);

  const [createClassName, setCreateClassName] = useState(styles.create);


  const closeEditor = () => {
    setCreateClassName(styles.create);
    //wait for animation
    setTimeout(() => {
      setIsEditing(false)
    }, 201)
  }

  const beginEditing = () => {
    setIsEditing(true);
  }

  useEffect(() => {
    if(prevIsEditing !== isEditing && prevIsEditing === false)
      setCreateClassName(`${styles.create} ${styles.open}`)
  }, [isEditing])


  const [currentParagraphsOpen, setCurrentParagraphsOpen] = useState(false);

  const showCurrentParagraphs = () => {
    setCurrentParagraphsOpen(!currentParagraphsOpen)
  }


  return (
    <div className={styles.wrapper}>
      { isEditing &&
        <div className={createClassName}>
          <p className={styles.title}>Paragraph editor</p>

          <IconRenderer
            onClick={closeEditor}
            icon={Crossmark}
            className={styles.close}
            onHover={{
              text: 'Close',
              direction: 'left'
            }}
          />

          <div className={(currentParagraphsOpen) ? `${styles.inner} ${styles.cpsOpen}` : styles.inner}>
            <div className={styles.newParagraph}>
              <p className={styles.headline}>New paragraph</p>
              <div className={styles.content}>
                <div className={styles.types}>
                  {selectors}
                </div>

                {selectedType === 'text' &&
                  <div className={styles.textContainer}>
                    <textarea value={paragraphText} onChange={(evt) => setParagraphText(evt.target.value)} placeholder="Enter paragraph text"></textarea>
                  </div>
                }

                <div className={styles.buttons}>
                  <div onClick={addParagraph} className={styles.add}>Add paragraph</div>
                </div>

              </div>
            </div>

            <div
              onClick={showCurrentParagraphs}
              className={styles.showCps}
            >
              <IconRenderer
                icon={RightArrow}
                className={styles.icon}
              />
            </div>

            <div className={styles.paragraphs}>
              <p className={styles.headline}>Current paragraphs</p>

              <div className={styles.content}>

                <ReactSortable
                  tag="div"
                  className={styles.ps}
                  list={paragraphs}
                  setList={setParagraphs}
                  handle={`.ps_draggable`}
                  animation={200}
                  swapThreshold={0.65}
                  group={{ name: 'ps', put: ['ps'], pull: 'ps' }}
                  forceFallback={true}
                >

                  {paragraphs.map(item => {
                    return (
                      <div key={item.id} className={styles.paragraph}>
                        <div className={styles.innerContainer}>
                          <p className={styles.text}>{item.text}</p>
                        </div>
                        <div className={styles.toolbar}>
                          <div className={`${styles.icons} ${styles.dragIcon} ps_draggable`}>
                            <IconRenderer
                              icon={Drag}
                              className={styles.icon}
                            />
                          </div>
                          <div className={`${styles.editIcon} ${styles.icons}`}>
                            <IconRenderer
                              icon={LightEdit}
                              className={styles.icon}
                            />
                          </div>
                          <div onClick={() => deleteParagraph(item)} className={` ${styles.trashIcon}`}>
                            <IconRenderer
                              icon={Trash}
                              className={styles.icon}
                              selectClass={styles.select}
                              onHover={{
                                direction: 'left',
                                text: 'Delete'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}

                </ReactSortable>

              </div>

            </div>


          </div>

        </div>
      }
      <div onClick={beginEditing} className={styles.begin}>
        <p className={styles.title}>Open paragraph editor</p>
      </div>
    </div>
  )

}

export default ParagraphCreator;
