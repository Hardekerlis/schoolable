import Head from 'next/head'


import styles from './default.module.sass'


const Layout = ({ children, mainClass }) => {

  return (

    <div className={styles.wrapper}>

      <Head>

        <meta lang="en" />

        <meta name="description" content="Now this is pod-racing." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet" />

        <script src="https://kit.fontawesome.com/96a8070015.js" crossorigin="anonymous"></script>
        

      </Head>

      <main className={mainClass}>{children}</main>


    </div>

  )

}


export default Layout;
