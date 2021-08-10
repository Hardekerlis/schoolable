//lib imports

import { useState, useEffect } from 'react';

//custom imports

import Layout from 'layouts/default/';

import { Grid, FirstTimeSetup } from 'components'

//css imports

import styles from './home.module.sass';


//!imports


const Home = ({ doFirstTimeSetup }) => {


  useEffect(() => {

    return () => {
      console.log("page: home; re-rendering and/or un-mounting")
    }

  })

  return (
    <Layout>

      <div className={styles.wrapper}>

        { doFirstTimeSetup && <FirstTimeSetup /> }

        <Grid />

      </div>

    </Layout>
  )

}

export default Home;
