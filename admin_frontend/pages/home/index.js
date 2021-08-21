import { useState, useEffect } from 'react';

import Head from 'next/head'

import { Post } from 'helpers/request.js'

import styles from './home.module.sass'

const Home = () => {

  let [adminAccount, setAdminAccount] = useState({
    name: 'Ole Sund',
    email: 'elo12881288@gmail.com',
    password: 'hejhej',
    confirmPassword: 'hejhej'
  });


  const adminCreate = async (evt) => {

    evt.preventDefault();

    let request = new Post('/api/admin/register', adminAccount).json();
    let res = await request.send();

    if(res.errors) {
      console.log(res.errors)
      alert("error occurred.")
      return;
    }

    console.log(res)

    alert(res.msg);

  }

  const adminChange = (evt, prop) => {

    setAdminAccount({
      ...adminAccount,
      [prop]: evt.target.value
    })

  }

  let [adminCredentials, setAdminCredentials] = useState({
    email: 'elo12881288@gmail.com',
    password: 'hejhej'
  });


  const adminCredentialsLogin = async (evt) => {

    evt.preventDefault();

    let request = new Post('/api/admin/login', adminCredentials).json();
    let res = await request.send();

    if(res.errors) {
      console.log(res.errors)
      alert("error occurred.")
      return;
    }

    alert(res.msg);

  }

  const adminCredentialsChange = (evt, prop) => {

    setAdminCredentials({
      ...adminCredentials,
      [prop]: evt.target.value
    })

  }



  let [newTeacher, setNewTeacher] = useState({
    name: 'Mr Teacher',
    email: 'teacherEmail@myTeacherEmail.teach',
    userType: 'teacher'
  });


  const teacherCreate = async (evt) => {

    evt.preventDefault();

    let request = new Post('/api/admin/users/register', newTeacher).json();
    let res = await request.send();

    if(res.errors) {
      console.log(res.errors)
      alert("error occurred.")
      return;
    }

    alert(res.msg);

  }

  const newTeacherChange = (evt, prop) => {

    setNewTeacher({
      ...newTeacher,
      [prop]: evt.target.value
    })

  }


  return (
    <div className={styles.wrapper}>

      <Head>

        <meta lang="en" />

        <meta name="description" content="Now this is pod-racing." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet" />


      </Head>


      <form onSubmit={adminCreate}>
        <p>Create admin account</p>
        <input value={adminAccount.name} onChange={(event) => adminChange(event, "name")} placeholder="Name" type="name" />
        <input value={adminAccount.email} onChange={(event) => adminChange(event, "email")} placeholder="Email" type="email" />
        <input value={adminAccount.password} onChange={(event) => adminChange(event, "password")} placeholder="Password" type="password" />
        <input value={adminAccount.confirmPassword} onChange={(event) => adminChange(event, "confirmPassword")} placeholder="Confirm password" type="password" />
        <button type="submit">Submit</button>
      </form>

      <form onSubmit={adminCredentialsLogin}>
        <p>Login to admin account</p>
        <input value={adminCredentials.email} onChange={(event) => adminCredentialsChange(event, "email")} placeholder="Email" type="email" />
        <input value={adminCredentials.password} onChange={(event) => adminCredentialsChange(event, "password")} placeholder="Password" type="password" />
        <button type="submit">Submit</button>
      </form>


      <form onSubmit={teacherCreate}>
        <p>Create new teacher account</p>
        <input value={newTeacher.name} onChange={(event) => newTeacherChange(event, "name")} placeholder="Name" type="name" />
        <input value={newTeacher.email} onChange={(event) => newTeacherChange(event, "email")} placeholder="Email" type="email" />
        <button type="submit">Submit</button>
      </form>


    </div>
  )
}

export default Home;
