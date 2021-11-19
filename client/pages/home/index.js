//lib imports

import { useState, useEffect } from 'react';

import { io } from "socket.io-client";


//custom imports

// import Request from 'helpers/request.js';

import {
  DepRequest as Request
} from 'helpers';

import Layout from 'layouts/default/';

import { Sidebar, Grid, FirstTimeSetup } from 'components';

//css imports

import styles from './home.module.sass';

//!imports

const Home = ({ doFirstTimeSetup }) => {

  useEffect(() => {


    const socket = io('http://dev.schoolable.se', {path: '/api/notifications/sockets'});


    console.log(socket)

    socket.on("ping", (msg) => {
      console.log(msg)
      socket.emit('ping', 'pong');
    })



    return () => {
      console.log('page: home; re-rendering and/or un-mounting');
    };
  });

  return (
    <Layout>
      <div className={styles.wrapper}>
        <Sidebar />

        {doFirstTimeSetup && <FirstTimeSetup />}

        <Grid />
      </div>
    </Layout>
  );
};

export default Home;
