import { useState, useEffect } from 'react';

import Head from 'next/head'

import { Post } from 'helpers/request.js'

import styles from './home.module.sass'

const Home = () => {

  let [adminAccount, setAdminAccount] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });


  const adminCreate = async (evt) => {

    evt.preventDefault();

    let request = new Post('/api/admin/register', adminAccount).json();
    let res = await request.send();

    console.log(res);

  }

  const adminChange = (evt, prop) => {

    setAdminAccount({
      ...adminAccount,
      [prop]: evt.target.value
    })

  }


  return (
    <div className={styles.wrapper}>

      <Head>

        <meta lang="en" />

        <meta name="description" content="Now this is pod-racing." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet" />


      </Head>


      <form onSubmit={adminCreate}>
        <input onChange={(event) => adminChange(event, "name")} placeholder="Name" type="name" />
        <input onChange={(event) => adminChange(event, "email")} placeholder="Email" type="email" />
        <input onChange={(event) => adminChange(event, "password")} placeholder="Password" type="password" />
        <input onChange={(event) => adminChange(event, "confirm_password")} placeholder="Confirm password" type="password" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default Home;
