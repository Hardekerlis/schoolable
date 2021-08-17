
const Cookies = require('cookies');

const { keys } = require('./tempAuthInfo.js');
const { getToken } = require('./tempAuthInfo.js');


export default function handler(req, res) {

  let reqBody;

  try {
    reqBody = JSON.parse(req.body);
  }catch(e) {
    res.status(200).json({});
    return;
  }

  // console.log("check api", getToken(), reqBody.token);

  let response = {
    success: true
  }

  if(!reqBody.token || reqBody.token !== getToken()) {
    response.success = false;
    // response.success = true;
  }

  res.status(200).json(response)
}
