import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Head from 'next/head';

import { firstLetterToUpperCase } from 'helpers';

import styles from './default.module.sass';

const Layout = ({ children, mainClass, title }) => {

  const router = useRouter();

  const [pageTitle, setPageTitle] = useState('Home');

  useEffect(() => {

    if(!title) {
      if(router.pathname === '/' || router.pathname === '/home') {
        setPageTitle('Home');
      }else {
        setPageTitle(firstLetterToUpperCase(router.pathname.substring(router.pathname.lastIndexOf('/') + 1, router.asPath.length)))
      }
    }else {
      setPageTitle(firstLetterToUpperCase(title));
    }

  }, [router.pathname, title])

  return (
    <div className={styles.wrapper}>
      <Head>
        <meta lang='en' />

        <title>{`${pageTitle} | Schoolable`}</title>

        <meta name='description' content='Now this is pod-racing.' />

        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='true'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap'
          rel='stylesheet'
        />

        <script
          src='https://kit.fontawesome.com/96a8070015.js'
          crossOrigin='anonymous'
        ></script>
      </Head>

      <main className={mainClass}>{children}</main>
    </div>
  );
};

export default Layout;
