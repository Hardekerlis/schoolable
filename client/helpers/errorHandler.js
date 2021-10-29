import React, { useEffect } from 'react';

import { useRouter } from 'next/router';

import { Prompt, PathWatcher } from 'helpers';

const ErrorHandler = (error) => {

  if(typeof window === 'undefined') return;

  const router = useRouter();

  useEffect(() => {

    if(error === false) return;

    Prompt.error(error.messages);

    if(error.status === 401) {
      //not authorized
      router.push(PathWatcher.getPrev());
    }

  }, [])

}

export default ErrorHandler;
