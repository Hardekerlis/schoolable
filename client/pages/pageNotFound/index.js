import { useRouter } from 'next/router';

import Layout from 'layouts/default';

import { Sidebar } from 'components';

import styles from './pageNotFound.module.sass';

const PageNotFound = () => {
  const router = useRouter();

  const goToPrev = () => {
    router.back();
  };

  return (
    <Layout>
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.container}>
          <p className={styles.main}>404 - Page not found.</p>
          <p className={styles.sub}>Sorry about that.</p>
          <button onClick={goToPrev}>Click me to go back</button>
        </div>
      </div>
    </Layout>
  );
};

export default PageNotFound;
