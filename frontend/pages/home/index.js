//lib imports

import { useState, useEffect } from 'react';

//custom imports

import Layout from '../../layouts/default/';

//css imports

import styles from './home.module.sass';


//!imports

const Home = ({ tmpCount, tmpSetCount }) => {

  const [count, setCount] = useState(0);

  const onTestClick = () => {

    tmpSetCount(tmpCount + 1)

  }

  useEffect(() => {

    console.log("home count:", count);


    return () => {
      console.log("page: home; re-rendering and/or un-mounting")
    }

  })

  const onClick = () => {

    setCount(count + 1);

  }


  return (
    <Layout>

      <div className={styles.wrapper}>

        <p style={{margin: 0}}>hejhej</p>
        <button onClick={onTestClick}>TEST</button>


        <button onClick={onClick}>OWN TEST</button>


      </div>

    </Layout>
  )

}

export default Home;
