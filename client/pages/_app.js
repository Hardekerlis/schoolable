import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import '../styles/global.sass';

import { PromptRender } from '/helpers/prompt/';

import { PathWatcher } from 'helpers';

function App({ Component, pageProps }) {

  const router = useRouter();

  useEffect(() => {

    PathWatcher.update(router.asPath);

  }, [router.asPath])

  useEffect(() => {
    return () => {
      console.log('_app; un-mounting...');
    };
  });

  return (
    <>
      <PromptRender />
      <Component {...pageProps} doFirstTimeSetup={false} />
    </>
  );
}

export default App;
