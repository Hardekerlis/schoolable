import Head from 'next/head'


import styles from './default.module.sass'


const Layout = ({ children }) => {

  return (

    <div className={styles.wrapper}>

      <Head>

        <meta lang="en" />

        <meta name="description" content="Now this is pod-racing." />



      </Head>

      <main>{children}</main>


    </div>

  )

}


export default Layout;
