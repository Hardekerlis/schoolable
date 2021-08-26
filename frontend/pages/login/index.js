import { useState } from 'react'

import { useRouter } from 'next/router';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import Cookies from 'js-cookie';

import Layout from 'layouts/default/';

import styles from './login.module.sass';


import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';


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
    password: '7ae1b14a-db70-4842-a1ba-511891400bfd',
    userType: 'teacher'
  })

  const submit = async(evt) => {
    evt.preventDefault();

    let request = new Request('/api/login', credentials).post().json();
    let res = await request.send();


    let user;

    try {
      user = JSON.stringify(res.user);
      Cookies.set('user', user);
    }catch(e) {
      return Prompt.error("Unexpected error. Please login again.");
    }

    if(res.errors) return Prompt.error(res.errors);

    router.push('/');

  }

  const credentialsChange = (evt, prop) => {

    let val = evt?.target?.value;

    if(!evt.target) {
      val = evt.value;
    }

    setCredentials({
      ...credentials,
      [prop]: val
    })

  }

  const selectOptions = [
    {
      value: 'teacher',
      label: 'Teacher'
    },
    {
      value: 'student',
      label: 'Student'
    },
    {
      value: 'legalGuardian',
      label: 'Legal guardian'
    }
  ]

  return (

    <Layout mainClass={styles.positioning}>

      <form onSubmit={submit} className={styles.form}>

        <p className={styles.title}>Login</p>

        <input value={credentials.email} onChange={(event) => credentialsChange(event, "email")} type="text" placeholder="Email" />
        <input value={credentials.password} onChange={(event) => credentialsChange(event, "password")} type="password" placeholder="Password" />

        <Dropdown
          className={styles.select}
          controlClassName={styles.selectControl}

          menuClassName={styles.selectMenu}

          arrowClassName={styles.selectArrow}

          options={selectOptions}
          value={credentials.userType}
          onChange={(value) => credentialsChange(value, "userType")}
        />

        <button className={styles.submitButton} type="submit">Login</button>

      </form>

    </Layout>

  )


}

// <select value={credentials.userType} onChange={(event) => credentialsChange(event, "userType")}>
//   <option value="teacher">Teacher</option>
//   <option value="student">Student</option>
//   <option value="legalGuardian">Legal guardian</option>
// </select>

export default Login;
