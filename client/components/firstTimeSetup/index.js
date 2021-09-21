import React, { useState, useEffect } from 'react';

import styles from './firstTimeSetup.module.sass';

import setupOptionsFn from './setupOptions.js'

import { Prompt } from '/helpers/prompt/'

import language from 'helpers/lang';
const lang = language.firstTimeSetup;

const setupOptions = setupOptionsFn();

const FirstTimeSetup = () => {

  const [currentIndex, setCurrentIndex] = useState(0)
  const [current, setCurrent] = useState({html: () => {}})
  const [currentViewer, setCurrentViewer] = useState(null)
  const [options, setOptions] = useState([])

  useEffect(() => {

    if(options.length == 0) {

      setOptions(setupOptions.map((opt, index) => {

        const orgMethod = opt.method;

        opt.method = (e, current) => {

          console.log(current, "not org")

          orgMethod(e, current);

        }

        // console.log(opt);

        return opt;
      }))

    }else {

      setCurrentViewer(options[0])

    }

  }, [options])


  let containerRef = React.useRef();

  const setContainerRef = elem => {
    containerRef = elem;
  }

  let viewerRef = React.useRef();

  const setViewerRef = elem => {
    viewerRef = elem;
  }

  let optionRef = React.useRef();
  const optionRefTransitionTime = 200; //in ms

  const setOptionRef = elem => {
    if(!elem) return;
    optionRef = elem;
  }

  useEffect(() => {

    if(!currentViewer) return;

    containerRef.style.height = viewerRef.getBoundingClientRect().height + "px"

    setTimeout(() => {

      optionRef.style.opacity = "1";

      setCurrent(currentViewer)

    }, 210)


  }, [currentViewer])

  const changePage = (dir) => {

    const newIndex = currentIndex + dir;

    // if(newIndex >= options.length || newIndex < 0) return;

    if(!current.completed && current.required) {
      Prompt.error(lang.completeOption);
    }

    optionRef.style.opacity = "0";


    setTimeout(() => {

      setCurrentViewer(options[newIndex])
      setCurrentIndex(newIndex)

    }, optionRefTransitionTime + 10)



  }

  return (
    <div className={styles.wrapper}>
      <div ref={setContainerRef} className={styles.container}>
        <p className={styles.title}>{lang.pageTitle}</p>
        <div className="hoz_line"></div>

        <div ref={setOptionRef} className={styles.optionContainer}>
          {!current == 0 &&
            <>
                <p className={styles.optionTitle}>{current.name}</p>
                <div className={styles.body}>
                  {current.html(current)}
                </div>
            </>
          }
        </div>

        <div className={styles.btnContainer}>
          <button onClick={() => changePage(-1)}>{lang.previous}</button>
          <button onClick={() => changePage(1)}>{lang.next}</button>
        </div>

      </div>
      <div ref={setViewerRef} className={`${styles.container} ${styles.viewer}`}>
        <p className={styles.title}>{lang.pageTitle}</p>
        <div className="hoz_line"></div>

        <div className={styles.optionContainer}>
          {!currentViewer == 0 &&
            <>
                <p className={styles.optionTitle}>{currentViewer.name}</p>
                <div className={styles.body}>
                  {currentViewer.html()}
                </div>
            </>
          }
        </div>

        <div className={styles.btnContainer}>
          <button onClick={() => changePage(-1)}>{lang.previous}</button>
          <button onClick={() => changePage(1)}>{lang.next}</button>
        </div>

      </div>
    </div>
  )

}

export default FirstTimeSetup;
