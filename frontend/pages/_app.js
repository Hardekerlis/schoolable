import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import '../styles/global.sass';

import { PromptRender } from '/helpers/prompt/'



function App({ Component, pageProps }) {

  const router = useRouter();

  const [count, setCount] = useState(0);

  useEffect(() => {

    console.log("count:", count);

    return () => {
      console.log("_app; un-mounting...");
    }

  });

  return (
    <>
      <PromptRender />
      <Component {...pageProps} doFirstTimeSetup={false} />
    </>
  )

}

export default App
