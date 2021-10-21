import Home from './home/';

import { authCheck, redirectToLogin } from 'helpers/auth.js';

export async function getServerSideProps(ctx) {

  if(!(await authCheck(ctx))) return redirectToLogin;

  return {
    props: {

    }
  }

}

export default Home;
