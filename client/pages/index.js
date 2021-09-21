import Home from './home/';

import redirectAuth from 'helpers/redirectAuth.js';

export async function getServerSideProps(ctx) {
  return redirectAuth(ctx);
}

export default Home;
