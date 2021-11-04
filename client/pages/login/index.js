import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Cookies from 'js-cookie';

import Layout from 'layouts/default/';

import styles from './login.module.sass';

// import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';

import { Loader } from 'components';

import Request from 'helpers/request/index.js';

import language from 'helpers/lang';
const lang = language.login;

import { authCheck } from 'helpers/auth.js';

export async function getServerSideProps(ctx) {
  const authed = await authCheck(ctx);

  if(authed === true) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const Login = () => {

  const router = useRouter();

  const [loaderActive, setLoaderActive] = useState(false);

  const [credentials, setCredentials] = useState({
    email: 'teacher@myTeacherEmail.teach',
    password: 'EJK3vBYMk_e2lYfm039VH',
  });

  const submit = async evt => {
    evt.preventDefault();

    setLoaderActive(true);

    const { data, meta } = await Request().sessions.post.json.body(credentials).result;

    //TODO: user cookie can be undefined.
    //this shouldnt be possible

    if(data.errors) {
      setLoaderActive(false);
      return Prompt.error(data.errors);
    }

    try {
      if(!data.user) throw 'error';
      Cookies.set('user', JSON.stringify(data.user));
    }catch (e) {
      setLoaderActive(false);
      return Prompt.error(lang.unexpected);
    }

    router.push('/');

  };

  const credentialsChange = (evt, prop) => {
    let val = evt?.target?.value;

    if(!evt.target) {
      val = evt.value;
    }

    setCredentials({
      ...credentials,
      [prop]: val,
    });
  };

  const [testingInput, setTestingInput] = useState('');

  const testingRef = React.useRef();
  const testingFnRef = React.useRef();

  const onTestingChange = (evt) => {
    setTestingInput(evt.target.value);
    testingRef.current = evt.target.value;
  }

  const generateTestingData = async() => {

    console.log('registering admin')
    let { data, meta } = await Request().client
      .users.add('register')
      .post
      .json
      .body({
        email: "elo12881288@gmail.com",
        name: {
            first: "Ole",
            last: "Sund"
        },
        userType: "admin"
      })
      .result;

    console.log(data);
    console.log("registered admin user. waiting for temp password")

    let pass;

    await new Promise((resolve, reject) => {
      testingFnRef.current = () => {
        pass = testingRef.current;
        testingFnRef.current = () => console.log("unset");
        resolve();
      }
    })

    console.log("logging in admin")
    let result = await Request().client
      .sessions
      .post
      .json
      .body({
        email: "elo12881288@gmail.com",
        password: pass
      })
      .result;

    console.log(result.data)

    console.log("registering teacher")
    result = await Request().client
      .users.add('register')
      .post
      .json
      .body({
        email: "teacher@myTeacherEmail.teach",
        name: {
            first: "Mr",
            last: "Teacher"
        },
        userType: "teacher"
      })
      .result;

    console.log(result.data);

    console.log("registered teacher user. waiting for teacher temp password")

    await new Promise((resolve, reject) => {
      testingFnRef.current = () => {
        pass = testingRef.current;
        testingFnRef.current = () => console.log("unset");
        resolve();
      }
    })

    console.log("logging in teacher")
    result = await Request().client
      .sessions
      .post
      .json
      .body({
        email: "teacher@myTeacherEmail.teach",
        password: pass
      })
      .result;

    console.log(result.data)

    console.log("updating login credentials")
    setCredentials({
      ...credentials,
      password: pass,
    });

    console.log('creating course')
    result = await Request().client
      .course.add('create')
      .post
      .json
      .body({
        name: 'Svenska'
      })
      .result

    console.log(result.data)


    console.log('creating phase')
    result = await Request().client
      .phase.add('create')
      .post
      .json
      .body({
        name: 'Lektion 1',
        parentCourseId: result.data.course.id
      })
      .result

    console.log(result.data)

    console.log('done')

  }

  return (
    <Layout mainClass={styles.positioning}>
      <Loader active={loaderActive} />
      <form onSubmit={submit} className={styles.form}>
        <p className={styles.title}>{lang.pageTitle}</p>

        <input
          value={credentials.email}
          onChange={event => credentialsChange(event, 'email')}
          type='text'
          placeholder={lang.email}
        />
        <input
          value={credentials.password}
          onChange={event => credentialsChange(event, 'password')}
          type='password'
          placeholder={lang.password}
        />

        <button className={styles.submitButton} type='submit'>
          {lang.loginBtn}
        </button>
      </form>
      <button onClick={generateTestingData}>Generate testing data</button>
      <input onChange={onTestingChange} value={testingInput} />
      <button onClick={() => testingFnRef.current()}>Done</button>
    </Layout>
  );
};

export default Login;
