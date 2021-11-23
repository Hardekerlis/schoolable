import React, { useState, useEffect } from 'react';

import { nanoid } from 'nanoid'

import {
  RightArrow
} from 'helpers/systemIcons'

import {
  firstLetterToUpperCase,
  IconRenderer
} from 'helpers'

import styles from './phase.module.sass'


import PhaseComments from './phaseComments';
import ParagraphCreator from './paragraphCreator';

const Phase = ({ data, className }) => {

  const [paragraphs, setParagraphs] = useState([]);
  const [paragraphsRender, setParagraphsRender] = useState([]);

  //Footer might only contain comments, always.
  const defaultFooter = {
    comments: null,
    commentsOpen: false
  }

  const [footer, setFooter] = useState(Object.create(defaultFooter))
  const [renderFooter, setRenderFooter] = useState(false);
  const [canHandIn, setCanHandIn] = useState(false);
  const [handInMenuOpen, setHandInMenuOpen] = useState(false);

  useEffect(() => {
    setRenderFooter(footer.comments)
  }, [footer])

  const toggleComments = () => {
    setFooter({
      comments: true,
      commentsOpen: !footer.commentsOpen
    })
  }


  useEffect(() => {
    //data will only change when switching phases.
    //so load all data here.

    // console.log("updating")
    //
    // console.log(data)

    setHandInMenuOpen(false);

    setParagraphs([
      {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        type: 'text',
        id: nanoid(6)
      }
    ])

    // setParagraphs(data.page?.paragraphs)

  }, [data])

  useEffect(() => {

    if(!paragraphs) return;

    setParagraphsRender(paragraphs.map((obj, index) => {

      if(obj.type === 'text') {
        return (
          <div key={index} className={styles.paragraph}>
            <p className={styles.text}>{obj.text}</p>
          </div>
        )
      }

      console.log("unsupported paragraph type")

    }))

  }, [paragraphs]);



  const openHandInMenu = () => {
    // if(!handInMenuOpen) return setHandInMenuOpen(true);
    setHandInMenuOpen(!handInMenuOpen)
  }

  //very ugly+
  let contentClassName = styles.content;
  if(footer.commentsOpen) {
    contentClassName += ` ${styles.footerOpen}`
  }

  let phaseClassName = styles.phase;

  if(className) {
    phaseClassName += ' ' + className;
  }

  return(
    <div className={phaseClassName}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.title}>{firstLetterToUpperCase("" + data?.name)}</p>
        </div>

        <div className={(renderFooter) ? contentClassName : `${contentClassName} ${styles.noFooter}`}>
          {paragraphsRender}
          <ParagraphCreator currentParagraphs={paragraphs} />
        </div>

        {renderFooter &&
          <div className={(footer.commentsOpen) ? `${styles.footer} ${styles.open}` : styles.footer}>
            <div onClick={toggleComments} className={styles.viewComments}>
              <div className={styles.text}>{(footer.commentsOpen) ? "Hide comments" : "View comments"}</div>
              <IconRenderer icon={RightArrow} className={styles.footerArrow} />
            </div>
            {footer.commentsOpen &&
              <>
                <PhaseComments comments={data.page?.comments.posts} />
              </>
            }
          </div>
        }
      </div>
    </div>
  )
}

export default Phase;
