import React, { useEffect, useState } from 'react';

import { DateTime } from 'luxon';

import language from 'helpers/lang';
const lang = language.coursePage.modules;

import {
  Module
} from 'components';

import {
  firstLetterToUpperCase
} from 'helpers';

import styles from './modules.module.sass';

const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const PhaseComments = ({ comments }) => {

  const [posts, setPosts] = useState([]);

  useEffect(() => {

    setPosts(comments.map((obj, index) => {

      console.log(obj);

      return (
        <div key={index} className={styles.post}>
          hej
        </div>
      )

    }))


  }, [comments])

  return posts;

}

const Phase = ({ data }) => {

  const [paragraphs, setParagraphs] = useState([]);
  const [paragraphsRender, setParagraphsRender] = useState([]);

  //Footer might only contain comments, always.
  const defaultFooter = {
    comments: null,
    commentsOpen: false
  }

  const [footer, setFooter] = useState(Object.create(defaultFooter))
  const [renderFooter, setRenderFooter] = useState(false);

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

    console.log("updating")

    console.log(data)

    if(!Object.prototype.hasOwnProperty.call(data, 'page')) {
      console.log("no page")
      //TODO: maybe remove all page data.
      return;
    }

    const { page } = data;


    if(page.comments.enabled) {
      //render comments

      setFooter({
        comments: true,
        commentsOpen: false
      })

    }else {
      setFooter({
        comments: false,
        commentsOpen: false
      })
    }

    if(!data.page || !data.page.paragraphs) {
      setParagraphs([]);
    }else {
      setParagraphs(data.page?.paragraphs)
    }

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

  // {footer.handIn === 'file' &&
  //   <div className={styles.upload}>
  //     <input type="file" id="actual-upload-input" hidden />
  //     <label for="actual-upload-input"><span>Choose a file</span>or drag it here.</label>
  //   </div>
  // }

  return(
    <div className={styles.phase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.title}>{firstLetterToUpperCase("" + data?.name)}</p>
        </div>

        <div className={(renderFooter) ? styles.content : `${styles.content} ${styles.noFooter}`}>
          {paragraphsRender}
        </div>

        {renderFooter &&
          <div className={(footer.commentsOpen) ? `${styles.footer} ${styles.open}` : styles.footer}>
            <div onClick={toggleComments} className={styles.viewComments}>{(footer.commentsOpen) ? "Hide comments" : "View comments"}</div>
            {footer.commentsOpen &&
              <>
                <PhaseComments comments={data.page.comments.posts} />
              </>
            }
          </div>
        }
      </div>
    </div>
  )
}

const Modules = ({ _modules, setLoaderActive }) => {

  if(!_modules) _modules = [];

  const [modules, setModules] = useState(_modules);
  const [modulesRender, setModulesRender] = useState();
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [phaseData, setPhaseData] = useState({});

  //basically if no phase in a module is the one selected. remove any selected phases from that module
  //sounds a bit weird. But each module keeps track of which phase is selected locally
  //so if a modules locally selected phase doesn't match the actual selected phase, remove it
  //checks if current selected phase is in that module if it's not remove the locally selected
  //phase
  const [moduleContainSelectedPhase, setModuleContainSelectedPhase] = useState(-1);

  const phaseClick = (phase, moduleIndex) => {

    setModuleContainSelectedPhase(moduleIndex);

    setPhaseData(phase);

    setPhaseOpen(true)

  }

  useEffect(() => {
    setModulesRender(
      modules.map((obj, index) => {
        return (
          <Module removeSelected={(moduleContainSelectedPhase === index) ? false : true} onPhaseClick={(phase) => phaseClick(phase, index)} key={index} id={obj.id} name={obj.name} phases={obj.phases} />
        );
      }),
    );
  }, [modules, phaseOpen, moduleContainSelectedPhase]);

  return(
    <div className={(phaseOpen) ? `${styles.page} ${styles.minified}` : styles.page}>
      <div className={styles.wrapper}>
        {modulesRender?.length === 0 ? (
          <p className={styles.noModulesText}>{lang.noModulesText}</p>
        ) : (
          <>
            <p className={styles.modulesText}>{lang.modules}</p>

            <div className={styles.modulesContainer}>
              {modulesRender}
            </div>
          </>
        )}
      </div>
      <Phase data={phaseData} />
    </div>
  )

}

export default Modules;
