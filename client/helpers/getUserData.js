import React, { useState, useEffect } from 'react';

import { Prompt } from 'helpers/prompt';

import Cookies from 'js-cookie'

const getUserData = () => {

  let [user, setUser] = useState({})

  useEffect(() => {

    let string = Cookies.get('user');

    try {
      setUser(JSON.parse(string));
    }catch(e) {
      Prompt.error("Couldn't load user data. Please logout and in again.")
    }

  }, []);

  return user;

}


export default getUserData;
