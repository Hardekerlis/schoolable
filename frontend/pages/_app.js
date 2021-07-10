import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router'

import '../styles/globals.css'

function App({ Component, pageProps }) {

  const router = useRouter();

  // const { user, loading }: {user: User, loading: boolean} = useUser();

  const [count, setCount] = useState(0);

  // log.i(pageProps);

  // useEffect(() => {
  //
  //   console.log(user, loading);
  //
  //
  // }, [user, loading])


  useEffect(() => {

    //do not update state inside of state listener...
    // setCount(count+1);

    console.log("count:", count);

    return () => {
      console.log("_app; un-mounting...");
    }

  });

  return <Component {...pageProps} tmpCount={count} tmpSetCount={setCount} />

}

export default App
