import cookies from 'next-cookies';

import Request from 'helpers/request.js';

export default async function redirectAuth(ctx) {

  const cookies_ = cookies(ctx);

  console.log("redirectAuth()")
  console.log(process.env.JWT_KEY)


  let request = new Request('/api/check').get();
  let response = await request.send();

  console.log(response)
  console.log(request)
  console.log("token", cookies_)

  if(response.status !== 200) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  return {
    props: {
      tokenVerified: true
    }, // will be passed to the page component as props
  }

}
