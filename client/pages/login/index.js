import { useState } from 'react';

import { useRouter } from 'next/router';

import Cookies from 'js-cookie';

import Layout from 'layouts/default/';

import styles from './login.module.sass';

import Request from 'helpers/request.js';

import { Prompt } from 'helpers/prompt';

import { Loader } from 'components';

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
    password: '3Hm74WHaJZqjlqqmePYVd',
  });

  const submit = async evt => {
    evt.preventDefault();

    setLoaderActive(true);

    let request = new Request('/api/auth/login', credentials).post().json();
    let res = await request.send();

    let user;

    //TODO: user cookie can be undefined.
    //this shouldnt be possible

    try {
      user = JSON.stringify(res.user);
      Cookies.set('user', user);
    }catch (e) {
      setLoaderActive(false);
      return Prompt.error(lang.unexpected);
    }

    if(res.errors) {
      setLoaderActive(false);
      return Prompt.error(res.errors);
    }

    let response = await (new Request('/api/session').get().json()).send();

    if(response.errors) {
      setLoaderActive(false);
      return Prompt.error(response.errors);
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
    </Layout>
  );
};

export default Login;
