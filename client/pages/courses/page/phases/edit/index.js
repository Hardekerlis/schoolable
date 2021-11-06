import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Image from 'next/image';

import Layout from 'layouts/default';

import {
  WarpBack,
  PlusClipboard,
  PlusList
 } from 'helpers/systemIcons'

import {
  Sidebar,
  Breadcrumbs,
  Loader,
  CourseNavigation,
  PhaseItem,
  PhaseItemShowcase,
  SampleCreationSystem,
  PhaseItemEditing
 } from 'components';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import language from 'helpers/lang';
const lang = language.phasesEdit;

import {
  handleErrors,
  Prompt,
  Request,
  ErrorHandler,
  getUserDataServer,
  requireQueries,
  Logger
} from 'helpers';

const logger = new Logger('/phases/edit');

import styles from './phasesEdit.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  const userData = getUserDataServer(ctx);

  //TODO: add this to all page.
  const canContinue = requireQueries(ctx, [
    'phase',
    'id'
  ])

  if(!canContinue) {
    logger.warn("Missing queries. Cannot render page properly. Redirecting to /pageNotFound");
    return {
      redirect: {
        destination: '/pageNotFound',
        permanent: false
      }
    }
  }

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
          ownerName: result.data.course.owner.name
        }

        //TODO: implement permissions check as well
        if(result.data.course.owner.id !== userData.userId) {
          return {
            redirect: {
              destination: '/pageNotFound',
              permanent: false,
            },
          };
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
      _phaseItems: phaseItems,
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

const Phases = ({ serverErrors, phase, _phaseItems, courseInfo, phaseItemSelected }) => {

  //TODO: track which course name is associated with this phase
  //else get it from an api call

  ErrorHandler(serverErrors)

  const router = useRouter();

  // console.log(phase)
  const [phaseItems, setPhaseItems] = useState(_phaseItems)

  const [loaderActive, setLoaderActive] = useState(false);
  const [itemRenders, setItemRenders] = useState([]);
  const [selectedItem, setSelectedItem] = useState(false);
  const [navOptions, setNavOptions] = useState([])

  const prevSelectedItem = usePrevious(selectedItem);
  const prevPhaseItems = usePrevious(phaseItems);

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

  const renderBreadcrumbs = () => {
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
          router.push(`/courses/page/phases/edit?id=${router.query.id}&phase=${router.query.phase}`);
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
  }

  useEffect(() => {

    renderBreadcrumbs();

  }, [selectedItem])



  const selectItem = (index) => {

    router.push(`${router.pathname}?id=${router.query.id}&phase=${router.query.phase}&item=${phaseItems[index].id}`)

    setSelectedItem(index)
  }

  const renderPhaseItems = () => {
    setItemRenders(phaseItems?.map((obj, index) => {
      return(
        <PhaseItemShowcase isEditing={true} onClick={() => selectItem(index)} list={(selectedItem === false) ? false : true} key={index} name={obj.name} description={"hej"} selected={index === selectedItem} />
      )
    }))
  }

  useEffect(() => {

    renderPhaseItems();

  }, [phaseItems, selectedItem])

  const listRef = React.useRef();

  const setListRef = elem => {
    if(!elem) return;
    listRef.current = elem;
  }

  const scrollToSelectedItem = (index) => {
    if(!index) index = selectedItem;
    if(listRef.current) {
      listRef.current.scrollTop = (100 * index) - (listRef.current.getBoundingClientRect().height/2.5);
    }
  }

  useEffect(() => {
    if(prevSelectedItem === false) {
      //scroll down to the selected item
      scrollToSelectedItem();
    }
  }, [selectedItem, listRef]);

  const onItemCreation = async response => {

    if(response.errors === false) {
      let arr = phaseItems.slice();

      arr.push(response.phaseItem);

      Prompt.success("Phase item created!");

      setPhaseItems(arr);

      return true;
    }else {
      Prompt.error(response.errors);
      return false;
    }

  }

  useEffect(() => {

    if(!prevPhaseItems || !phaseItems) return;

    if(prevPhaseItems.length !== phaseItems.length) {
      //created new phaseItem
      //select that item for editing
      setSelectedItem(phaseItems.length-1)
      scrollToSelectedItem(phaseItems.length-1);
    }

  }, [phaseItems])

  //TODO: Look over create phase item symbol.

  const itemUpdate = (newItemData) => {
    phaseItems[selectedItem].name = newItemData.name;
    renderPhaseItems();
    //onyl re-render breadcrumbs if the selectedItem
    //is being changed, which it is
    renderBreadcrumbs();
  }

  return (
    <Layout title={`${lang.layoutTitle} ${phase.name}`}>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.page}>

          <div className={styles.header}>

            <div className={styles.breadcrumbs}>
              <p className={styles.editing}>{lang.editingText}</p>
              <Breadcrumbs options={navOptions} />
            </div>

            <p className={styles.ownerName}>{`${courseInfo.ownerName?.first} ${courseInfo.ownerName?.last}`}</p>

          </div>

          <div className={styles.hozLine}></div>

          <CourseNavigation options={[
            {
              text: lang.goBack,
              onClick: () => navTo(`/courses/page?id=${router.query.id}`),
              icon: WarpBack
            },
          ]} />

          <div className={styles.inner}>

          <SampleCreationSystem
            creationContainerClassName={styles.creationSystemContainer}
            createItemButtonClassName={styles.createPhaseButton}
            body={{
              parentCourseId: router.query.id,
              parentPhaseId: router.query.phase
            }}
            requestCallback={onItemCreation}
            itemApiPath={`/api/phaseitem/create`}
            currentItems={phaseItems}
            itemName={lang.creationSystemItemName}
            noCurrentItemText={lang.noPhaseItemsFound}
            createAdditionalItemIcon={PlusList}
          />

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

                  <PhaseItemEditing itemUpdate={itemUpdate} item={phaseItems[selectedItem]} index={selectedItem} />

                </>

            }

          </div>


        </div>
      </div>
    </Layout>
  );
};

export default Phases;
