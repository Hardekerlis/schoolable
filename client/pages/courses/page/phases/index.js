import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Image from 'next/image';

import Layout from 'layouts/default';

import {
  WarpBack,
  Edit
} from 'helpers/systemIcons'

import { Sidebar, Breadcrumbs, Loader, CourseNavigation, PhaseItem, PhaseItemShowcase } from 'components';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import {
  handleErrors,
  Prompt,
  Request,
  ErrorHandler,
  getUserData
} from 'helpers';

import language from 'helpers/lang';
const lang = language.phases;

import styles from './phases.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  let { data, meta } = await Request().server
    .phase.add(`fetch/${ctx.query.phase}`)
    .body({
      parentCourseId: ctx.query.id
    })
    .post
    .json
    .c(ctx)
    .result;

  let serverErrors = handleErrors(200, [404], data, meta);

  let phase = {};
  let phaseItems = [];
  let courseInfo = {};
  let phaseItemSelected = '';

  if(serverErrors === false) {
    phase = data.phase;

    //fetch phaseItems

    let result = await Request().server
      .phaseitem.add('fetch')
      .post
      .json
      .c(ctx)
      .body({
        parentCourseId: ctx.query.id,
        parentPhaseId: ctx.query.phase
      })
      .result

    serverErrors = handleErrors(200, [404], result.data, result.meta);

    if(serverErrors === false) {
      phaseItems = result.data.phaseItems;


      //fetch course name
      result = await Request().server
        .course.add(`fetch/${ctx.query.id}`)
        .get
        .json
        .c(ctx)
        .result;

      serverErrors = handleErrors(200, [404], result.data, result.meta);

      if(serverErrors === false) {
        courseInfo = {
          name: result.data.course.name,
          ownerName: result.data.course.owner.name,
          ownerId: result.data.course.owner.id
        }

        if(ctx.query.item !== undefined) {

          phaseItemSelected = ctx.query.item;

        }

      }

    }

  }

  return {
    props: {
      serverErrors,
      phase,
      courseInfo,
      phaseItems,
      phaseItemSelected
    },
  };
};


const usePrevious = (value) => {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Phases = ({ serverErrors, phase, phaseItems, courseInfo, phaseItemSelected }) => {

  //TODO: track which course name is associated with this phase
  //else get it from an api call

  ErrorHandler(serverErrors)

  const router = useRouter();

  // console.log(phase)

  const [loaderActive, setLoaderActive] = useState(false);
  const [itemRenders, setItemRenders] = useState([]);
  const [selectedItem, setSelectedItem] = useState(false);
  const [navOptions, setNavOptions] = useState([])

  const prevSelectedItem = usePrevious(selectedItem);

  const navTo = (path) => {

    setLoaderActive(true)
    router.push(path)

  }

  useEffect(() => {

    if(phaseItemSelected?.length !== 0) {
      for(let i = 0; i < phaseItems.length; i++) {
        if(phaseItems[i].id === phaseItemSelected) {
          setSelectedItem(i);
          break;
        }
      }
    }


  }, [])

  useEffect(() => {

    let options = [
      {
        name: courseInfo?.name,
        onClick: () => navTo(`/courses/page?id=${router.query.id}`)
      },
      {
        name: phase.name,
        selected: true,
        onClick: () => {
          setSelectedItem(false);
          router.push(`/courses/page/phases?id=${router.query.id}&phase=${router.query.phase}`);
        }
      }
    ]

    if(selectedItem !== false) {
      options[1].selected = false;
      options.push({
        name: phaseItems[selectedItem].name,
        selected: true,
        onClick: () => console.log("clicked phaseItem")
      })
    }

    setNavOptions(options);

  }, [selectedItem])



  const selectItem = (index) => {

    //TODO: maybe not push it, just update path.

    router.push(`${router.pathname}?id=${router.query.id}&phase=${router.query.phase}&item=${phaseItems[index].id}`)

    setSelectedItem(index)
  }

  useEffect(() => {

    setItemRenders(phaseItems?.map((obj, index) => {
      return(
        <PhaseItemShowcase onClick={() => selectItem(index)} list={(selectedItem === false) ? false : true} key={index} name={obj.name} description={"hej"} selected={index === selectedItem} />
      )
    }))

  }, [phaseItems, selectedItem])

  const listRef = React.useRef();

  const setListRef = elem => {
    if(!elem) return;
    listRef.current = elem;
  }

  useEffect(() => {

    if(prevSelectedItem === false) {
      //scroll down to the selected item

      if(listRef.current) {

        const selectedElem = listRef.current.children[selectedItem];

        listRef.current.scrollTop = (100 * selectedItem) - (listRef.current.getBoundingClientRect().height/2.5);


      }

    }

  }, [selectedItem, listRef])

  const userData = getUserData();

  //TODO: implement permissions check as well
  const canUserEditPage = (userData.userId === courseInfo.ownerId) ? true : false;

  let courseNavigationOptions = [
    {
      text: lang.goBack,
      onClick: () => navTo(`/courses/page?id=${router.query.id}`),
      icon: WarpBack
    },
  ];

  const editPhaseClick = () => {
    setLoaderActive(true);
    router.push(`/courses/page/phases/edit?id=${router.query.id}&phase=${router.query.phase}`);
  }

  if(canUserEditPage) courseNavigationOptions.push(
    {
      text: lang.editPhase,
      onClick: editPhaseClick,
      icon: Edit,
    }
  )

  return (
    <Layout title={phase.name}>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.page}>

          <div className={styles.header}>

            <div className={styles.breadcrumbs}>
              <Breadcrumbs options={navOptions} />
            </div>

            <p className={styles.ownerName}>{`${courseInfo.ownerName?.first} ${courseInfo.ownerName?.last}`}</p>

          </div>

          <div className={styles.hozLine}></div>

          <CourseNavigation options={courseNavigationOptions} />

          <div className={styles.inner}>

            { (selectedItem === false) ?

                <>

                  <div className={styles.content}>

                    {itemRenders}

                  </div>


                  <div className={styles.information}>
                    <div className={styles.verLine}></div>
                    <p className={styles.descTitle}>{lang.phaseDescription}</p>
                    <p className={styles.desc}>
                      {phase.description}
                    </p>
                  </div>

                </>

              :

                <>

                  <div ref={setListRef} className={`${styles.content} ${styles.minified}`}>

                    {itemRenders}

                  </div>

                  <PhaseItem />

                </>

            }

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Phases;
