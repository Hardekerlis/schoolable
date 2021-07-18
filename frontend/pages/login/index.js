import { useRouter } from 'next/router';

import Layout from 'layouts/default/';

import styles from './login.module.sass';


import Post from 'helpers/post.js'


import redirectAuth from 'helpers/redirectAuth.js';

export async function getServerSideProps(ctx) {

  const { props } = await redirectAuth(ctx);

  if(props?.tokenVerified === true) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}


const Login = () => {

  const router = useRouter();

  const submit = async(evt) => {
    evt.preventDefault();

    const credentials = {
      username: evt.target.children[0].value,
      password: evt.target.children[1].value,
      type: evt.target.children[2].value
    }

    let request = new Post('/api/auth', credentials).json();
    let res = await request.send();

    if(res.error) return showError(res.message);

    router.push('/');

  }

  const showError = (msg) => {

    console.log('ERROR:', msg);

  }

  return (

    <Layout mainClass={styles.positioning}>

      <form onSubmit={submit} className={styles.form}>

        <input type="username" placeholder="username" />
        <input type="password" placeholder="password" />

        <select>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="guardian">Guardian</option>
        </select>

        <button type="submit">Login</button>

      </form>

    </Layout>

  )


}

export default Login;
