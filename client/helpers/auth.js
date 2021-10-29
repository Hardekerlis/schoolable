import cookies from 'next-cookies';

import Request from 'helpers/request.js';

const authCheck = async (ctx) => {
  const { req } = ctx;

  // console.log(req.headers)

  // const { token } = cookies(ctx);
  //
  // console.log(token)

  let request = new Request('/api/sessions/check')
    .get()
    .json()
    .headers(req.headers);
  let response = await request.send();

  if(response._response?.status === 200) return true;
  return false;

}

const redirectToLogin = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
};


export {
  authCheck,
  redirectToLogin
}

// export default async function redirectAuth(ctx) {
//   const { req } = ctx;
//
//   // console.log(req.headers)
//
//   // const { token } = cookies(ctx);
//   //
//   // console.log(token)
//
//   let request = new Request('/api/auth/check')
//     .get()
//     .json()
//     .headers(req.headers);
//   let response = await request.send();
//
//   // console.log(response.headers)
//
//   // if(response._response.status !== 200) {
//   //   return {
//   //     redirect: {
//   //       destination: '/login',
//   //       permanent: false,
//   //     },
//   //   };
//   // }
//   //
//   // return {
//   //   props: {
//   //     tokenVerified: true,
//   //   }, // will be passed to the page component as props
//   // };
// }
