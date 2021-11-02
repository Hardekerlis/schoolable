import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Image from 'next/image';

import Layout from 'layouts/default';

import { WarpBack } from 'helpers/systemIcons'

import { Sidebar, Breadcrumbs, Loader, CourseNavigation, PhaseItem, PhaseItemShowcase } from 'components';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

import {
  handleErrors,
  Prompt,
  Request,
  ErrorHandler
} from 'helpers';

import styles from './phases.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  // let res = await new Request(`/api/phase/fetch/${ctx.query.phase}`, {
  //   parentCourse: ctx.query.id
  // }).post().json().ctx(ctx).send();

  let { data, meta } = await Request().server
    .phase.add(`fetch/${ctx.query.phase}`)
    .body({
      parentCourse: ctx.query.id
    })
    .post
    .json
    .c(ctx)
    .result;

  // console.log(res)

  let serverErrors = handleErrors(200, [404], data, meta);

  let phase = {};
  let phaseItems = [];
  let courseInfo = {};

  if(serverErrors === false) {
    phase = data.phase;

    //fetch phaseItems

    let result = await Request().server
      .phaseitem.add('fetch')
      .post
      .json
      .c(ctx)
      .body({
        parentCourse: ctx.query.id,
        phaseId: ctx.query.phase
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
      }

    }

  }

  return {
    props: {
      serverErrors,
      phase,
      courseInfo,
      phaseItems,
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

const Phases = ({ serverErrors, phase, phaseItems, courseInfo }) => {

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

  useEffect(async() => {

    // let request = new Request(`/api/phaseitems/create`, {
    //   name: 'My phaseItem',
    //   phaseId: router.query.phase,
    //   parentCourse: router.query.id
    // })
    //   .post()
    //   .json()
    // let res = await request.send();

    // console.log(res)


    // const { data, meta } = await Request().client
    //   .phaseitem.add('create')
    //   .body({
    //     name: 'My phaseItem',
    //     phaseId: router.query.phase,
    //     parentCourse: router.query.id
    //   })
    //   .post
    //   .json
    //   .result;
    //
    // console.log(data)




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
        onClick: () => router.reload()
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
    setSelectedItem(index)
  }

  useEffect(() => {

    setItemRenders(phaseItems?.map((obj, index) => {

      console.log(obj)

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

  return (
    <Layout>
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

          <CourseNavigation options={[
            {
              text: 'Go back',
              onClick: () => navTo(`/courses/page?id=${router.query.id}`),
              icon: WarpBack
            },
          ]} />

          <div className={styles.inner}>

            { (selectedItem === false) ?

                <>

                  <div className={styles.content}>

                    {itemRenders}

                  </div>


                  <div className={styles.information}>
                    <div className={styles.verLine}></div>
                    <p className={styles.descTitle}>Phase description</p>
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
