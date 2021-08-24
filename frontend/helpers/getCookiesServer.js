import cookies from 'next-cookies';

const getCookies = (ctx) => {

  return cookies(ctx);

}

export default getCookies;
