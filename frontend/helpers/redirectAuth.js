import cookies from 'next-cookies';

import Post from 'helpers/post.js';

export default async function redirectAuth(ctx) {

  const { token } = cookies(ctx);

  let request = new Post('/api/check', {token}).json();
  let response = await request.send();

  if(!response.success) {
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
