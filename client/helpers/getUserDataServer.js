import getCookies from 'helpers/getCookiesServer.js';

const getUserDataServer = ctx => {
  let { user } = getCookies(ctx);

  if(typeof user === 'string')
    console.error('user cookie was string. (server side)');

  return user;
};

export default getUserDataServer;
