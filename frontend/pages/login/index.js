import { useState } from 'react'

import { useRouter } from 'next/router';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';



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
    password: '95891bb6-23f1-482d-a91c-79fac8566dc6',
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

    let val = evt?.target?.value;

    if(!evt.target) {
      val = evt.value;
    }

    console.log("value", val);

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

        <input value={credentials.email} onChange={(event) => credentialsChange(event, "email")} type="email" placeholder="Email" />
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
