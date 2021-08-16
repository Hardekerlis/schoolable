//lib imports

import { useState, useEffect } from 'react';

//custom imports

import Layout from 'layouts/default/';

import { Sidebar } from 'components'

//css imports

import styles from './courses.module.sass';


//!imports


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
