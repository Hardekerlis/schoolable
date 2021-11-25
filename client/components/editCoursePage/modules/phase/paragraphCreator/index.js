import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import { ReactSortable, Sortable } from "react-sortablejs";

import Cookies from 'js-cookie';

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

import BuildContent from '../buildParagraphContent.js';



const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const ParagraphCreator = ({ currentParagraphs, queryPhaseOpenedOnReload, phaseQueryHandled }) => {

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

  useEffect(() => {

    setParagraphs(currentParagraphs)

  }, [currentParagraphs])


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

  const resetFields = () => {
    //reset all fields.

    setParagraphText('');
    setSelectedType('text');

  }


  const [isEditing, setIsEditing] = useState(false);
  const prevIsEditing = usePrevious(isEditing);

  const [createClassName, setCreateClassName] = useState(styles.create);


  const setEditingCookie = (bool) => {
    console.log("setting paragraphEditorOpen cookie:", bool)
    Cookies.set('paragraphEditorOpen', bool);
  }

  useEffect(() => {
    console.log("checking paragraphEditorOpen cookie. (should only run on page refresh)");
    console.log("cookie value:", paragraphEditorOpen)

    if(!phaseQueryHandled) return;

    //TODO: might have to run additional code to ensure
    //that the paragraphEditorOpen cookie is set to false
    //if the cookie is true and a phase isn't opened on reload
    //DONE. using queryPhaseHandled from modules for this.

    let paragraphEditorOpen = Cookies.get('paragraphEditorOpen');

    if(!queryPhaseOpenedOnReload) {
      //no phase was opened on reload
      //so ensuring that the paragraphEditorOpen cookie
      //is false if the user manually changes the url to include a
      //phaseId. (it would open, without the user requesting it, otherwise)
      setEditingCookie(false);
      return;
    }

    if(paragraphEditorOpen === 'true') {
      setIsEditing(true);
    }else {
      //basically the same principle as the above comment.
      setEditingCookie(false);
    }
  }, [queryPhaseOpenedOnReload])


  const closeEditor = () => {
    setCreateClassName(styles.create);
    setEditingCookie(false);
    //wait for animation
    setTimeout(() => {
      setIsEditing(false)
    }, 201)
  }

  const beginEditing = () => {
    setEditingCookie(true);
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


  //is the user editing an existing paragraph
  const [editingParagraph, setEditingParagraph] = useState(false);
  //the original paragraph the user is editing.
  const [paragraphForEditing, setParagraphForEditing] = useState({})

  const editParagraph = p => {

    setEditingParagraph(true);
    setParagraphForEditing(p);
    setSelectedType(p.type);

    //TODO: handle all paragraph types
    setParagraphText(p.content)

  }

  const saveEdits = () => {
    //save the edits made on the currently selected paragraph
    console.log("saving changes...");
    // console.log(paragraphForEditing)

    let paragraphIndex = -1;

    //have to loop through paragraphs if the chosen paragraph have
    //changed index.
    let i = 0;
    for(let p of paragraphs) {
      if(p.id === paragraphForEditing.id) {
        paragraphIndex = i;
      }
      i++;
    }

    if(paragraphIndex === -1) {
      //TODO: maybe handle this better
      return Prompt.error("An unexpected error occurred.")
    }

    let arr = paragraphs.slice();

    //TODO: handle all paragraph types
    arr[paragraphIndex].content = paragraphText;

    setParagraphs(arr);

    setParagraphForEditing({});
    setEditingParagraph(false);
    resetFields();
  }

  const cancelEdits = () => {
    //cancel all edits made on paragraph
    console.log("reverting changes...")
    setParagraphForEditing({});
    setEditingParagraph(false);
    resetFields();
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
              <p className={styles.headline}>{(editingParagraph) ? "Editing paragraph" : "New paragraph"}</p>
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
                  {editingParagraph ?
                      <>
                        <div onClick={saveEdits} className={styles.add}>Save</div>
                        <div onClick={cancelEdits} className={styles.reset}>Cancel</div>
                      </>
                    :
                      <>
                        <div onClick={addParagraph} className={styles.add}>Add paragraph</div>
                        <div onClick={resetFields} className={styles.reset}>Reset</div>
                      </>
                  }

                </div>
              </div>
            </div>

            <div
              onClick={showCurrentParagraphs}
              className={styles.showCps}
            >
              <p className={styles.text}>{(currentParagraphsOpen) ? 'Hide paragraphs' : 'Show paragraphs'}</p>
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

                    let content = BuildContent(item.content, item.type);

                    return (
                      <div key={item.id} className={styles.paragraph}>
                        <div className={styles.innerContainer}>
                          <p className={styles.text}>{content}</p>
                        </div>
                        <div className={styles.toolbar}>
                          <div className={`${styles.icons} ${styles.dragIcon} ps_draggable`}>
                            <IconRenderer
                              icon={Drag}
                              className={styles.icon}
                            />
                          </div>
                          <div onClick={() => editParagraph(item)} className={`${styles.editIcon} ${styles.icons}`}>
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
