import React, { useEffect, useState } from 'react';

import { DateTime } from 'luxon';

import language from 'helpers/lang';
const lang = language.coursePage.modules;

import {
  RightArrow,
  Checkbox,
  CheckboxChecked
} from 'helpers/systemIcons';

import {
  Module
} from 'components';

import {
  firstLetterToUpperCase,
  IconRenderer,
  Logger
} from 'helpers';

const logger = new Logger('/coursePage/modules/index.js');

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

      let date = DateTime.fromSeconds(obj.createdAt.getTime());

      //TODO: Handle times from other months
      let time = `${date.toFormat('HH:mm')} on ${date.toFormat('cccc')}`

      return (
        <div key={index} className={styles.post}>
          <p className={styles.text}>{obj.text}</p>
          <p className={styles.author}>At {time} by {obj.name}</p>
        </div>
      )

    }))

  }, [comments])

  return (
    <div className={styles.posts}>
      {posts}
    </div>
  )

}

const HandInMenu = ({ types, phaseRef }) => {

  // console.log(types)

  // const renders = types.map((obj, index) => {
  //   return (
  //     <div className={styles.toggler}>
  //       <p className={styles.text}>{obj}</p>
  //     </div>
  //   )
  // })

  const [typeRenders, setTypeRenders] = useState([]);
  const [selected, setSelected] = useState(0);

  const [menuWrapperWidth, setMenuWrapperWidth] = useState(0);

  const selectType = (index) => {
    if(index === selected) return;

    setSelected(index);

  }

  useEffect(() => {

    if(!types) return;

    let list = [];
    setTypeRenders(types.forEach(name => {
      const len = list.length;
      if(name === 'googleDrive') name = 'Google Drive'
      list.push(
        <div key={len} className={(selected === len) ? `${styles.togglerParent} ${styles.selected}` : styles.togglerParent}>
          <div onClick={() => selectType(len)} className={styles.toggler}>
            {selected === len ?
                <IconRenderer icon={CheckboxChecked} className={styles.box} />
              :
                <IconRenderer icon={Checkbox} className={styles.box} />
            }
            <p className={styles.text}>{firstLetterToUpperCase(name)}</p>
          </div>
        </div>
      )
    }))
    setTypeRenders(list);

  }, [types, selected])

  const waitFor = async(ms) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms)
    })
  }

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if(typeof window === 'undefined') return;

    logger.log("adding resize listener");
    window.addEventListener('resize', () => {

      let width = window.innerWidth || window.outerWidth;

      setWindowWidth(width);

      // console.log("resize")

    })
  }, [])

  useEffect(async() => {
    //calculate menuWrapper width.

    if(!phaseRef.current) return;


    const getPhaseWidth = () => {
      return phaseRef.current.getBoundingClientRect().width;
    }

    if(getPhaseWidth() === 0) {
      //has to wait for animation
      await waitFor(210)
    }

    //0.42 = 42%
    let width = Math.floor(getPhaseWidth()) * 0.42;

    //-10 = margin-left 10
    setMenuWrapperWidth(width - 10);

  }, [phaseRef.current, types, windowWidth])


  return (
    <div className={styles.handInMenu}>
      <div style={{width: `${menuWrapperWidth}px`}} className={styles.menuWrapper}>
        <div className={styles.board}>
          {typeRenders}
        </div>
      </div>
    </div>
  )

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

    console.log("updating")

    console.log(data)

    setHandInMenuOpen(false);

    if(!Object.prototype.hasOwnProperty.call(data, 'page')) {
      console.log("no page")
      //TODO: maybe remove all page data.

      setFooter({
        comments: false,
        commentsOpen: false
      })

      setParagraphs([]);

      setCanHandIn(false);

      return;
    }

    const { page } = data;


    if(page.handInTypes) {
      setCanHandIn(true);
    }

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

    if(!data.page.paragraphs) {
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

  const openHandInMenu = () => {
    // if(!handInMenuOpen) return setHandInMenuOpen(true);
    setHandInMenuOpen(!handInMenuOpen)
  }

  //very ugly+
  let contentClassName = styles.content;
  if(footer.commentsOpen) {
    contentClassName += ` ${styles.footerOpen}`
  }

  const phaseRef = React.useRef();

  return(
    <div ref={phaseRef} className={(handInMenuOpen) ? `${styles.phase} ${styles.handInMenuOpen}` : styles.phase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.title}>{firstLetterToUpperCase("" + data?.name)}</p>
          {canHandIn &&
            <div onClick={openHandInMenu} className={styles.handIn}>
              <p className={styles.text}>Hand in</p>
            </div>
          }
        </div>

        <div className={(renderFooter) ? contentClassName : `${contentClassName} ${styles.noFooter}`}>
          {paragraphsRender}
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
      <HandInMenu phaseRef={phaseRef} types={data.page?.handInTypes} />
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

    if(phase === -1) {
      //close phasePage
      setPhaseOpen(false)
      return;
    }

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
