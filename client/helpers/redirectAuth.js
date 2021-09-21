import cookies from 'next-cookies';

import Request from 'helpers/request.js';

export default async function redirectAuth(ctx) {

  const { sessionId } = cookies(ctx);

  // console.log("sessionId", sessionId)

  let request = new Request('/api/check', {sessionId}).post().json();
  let response = await request.send();

  // console.log(response)

  if(response._response.status !== 200) {
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
