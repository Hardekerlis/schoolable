import cookies from 'next-cookies';

// import Request from 'helpers/request.js';
import { Request } from 'helpers';

const authCheck = async (ctx) => {

  try {

    const { meta } = await Request().server.sessions.add('check').get.json.c(ctx).result;

    if(meta?.status === 200) return true;
    return false;

  }catch(err) {

    console.log(err);
    console.log("please check the above error.");
    console.log('check failed, assuming that the "sessions" service crashed or is offline.');

    return true;

  }


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
