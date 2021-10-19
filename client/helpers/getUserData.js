import React, { useState, useEffect } from 'react';

import { Prompt } from 'helpers/prompt';

import Cookies from 'js-cookie';

const getUserData = () => {

  let [user, setUser] = useState(null)

  useEffect(() => {

    if(user !== null) return;

    let string = Cookies.get('user');

    let u;

    try {
      u = JSON.parse(string);
    }catch(e) {
      return Prompt.error("Couldn't load user data. Please logout and in again.")
    }

    setUser(u);

  }, []);

  if(user === null) return {};

  return user;

}


export default getUserData;
