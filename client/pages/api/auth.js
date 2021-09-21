// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const Cookies = require('cookies');

import { v4 as uuidv4 } from 'uuid';

const { tempUser } = require('./tempAuthInfo.js');
const { keys } = require('./tempAuthInfo.js');
const { setToken, getToken } = require('./tempAuthInfo.js');

export default function handler(req, res) {

  const cookies = new Cookies(req, res)

  let reqData = JSON.parse(req.body);
  let response = {
    error: true,
    authed: false,
    message: 'Invalid credentials.'
  }

  if(JSON.stringify(reqData) === JSON.stringify(tempUser)) {

    response.error = false;
    response.authed = true;
    delete response.message;

    setToken(uuidv4());

    cookies.set('token', getToken())

  }

  res.status(200).json(response)

}
