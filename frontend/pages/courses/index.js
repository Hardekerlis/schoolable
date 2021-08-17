//lib imports

import { useState, useEffect } from 'react';

//custom imports

import Request from 'helpers/request.js'

import Layout from 'layouts/default/';

import { Sidebar } from 'components'

//css imports

import styles from './courses.module.sass';


//!imports

export const getServerSideProps = async(ctx) => {

  // let request = new Request('/api/course', credentials).post().json();
  // let res = await request.send();

  return {
    props: {

    }
  }

}


const Courses = () => {

  return (
    <Layout>

      <div className={styles.wrapper}>

        <Sidebar />



      </div>

    </Layout>
  )

}

export default Courses;
