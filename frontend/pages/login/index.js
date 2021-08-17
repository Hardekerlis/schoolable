import { useState } from 'react'

import { useRouter } from 'next/router';

import Layout from 'layouts/default/';

import styles from './login.module.sass';


import Request from 'helpers/request.js'


import redirectAuth from 'helpers/redirectAuth.js';

export async function getServerSideProps(ctx) {

  const { props } = await redirectAuth(ctx);

  if(props?.tokenVerified === true) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}


const Login = () => {

  const router = useRouter();

  let [credentials, setCredentials] = useState({
    email: 'teacherEmail@myTeacherEmail.teach',
    password: '979fc8d0-46f0-4278-b84c-22c161928085',
    userType: 'teacher'
  })

  const submit = async(evt) => {
    evt.preventDefault();

    let request = new Request('/api/login', credentials).post().json();
    let res = await request.send();

    if(res.errors) return showError(res.errors);

    router.push('/');

  }

  const showError = (msg) => {

    console.log('ERROR:', msg);

  }

  const credentialsChange = (evt, prop) => {

    setCredentials({
      ...credentials,
      [prop]: evt.target.value
    })

  }

  return (

    <Layout mainClass={styles.positioning}>

      <form onSubmit={submit} className={styles.form}>

        <input value={credentials.email} onChange={(event) => credentialsChange(event, "email")} type="email" placeholder="Email" />
        <input value={credentials.password} onChange={(event) => credentialsChange(event, "password")} type="password" placeholder="Password" />

        <select value={credentials.userType} onChange={(event) => credentialsChange(event, "userType")}>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="legalGuardian">Legal guardian</option>
        </select>

        <button type="submit">Login</button>

      </form>

    </Layout>

  )


}

export default Login;
