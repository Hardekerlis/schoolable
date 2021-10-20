import { useRouter } from 'next/router';

import { firstLetterToUpperCase } from 'helpers/misc.js';

import language from 'helpers/lang';
const lang = language.courses;

import styles from './coursePreview.module.sass';

const CoursePreview = ({ course }) => {
  const router = useRouter();

  let courseName = firstLetterToUpperCase(course.name);

  const courseClick = () =>
    router.push(`/courses/page?id=${course.id}&sub=overview`);

  return (
    <div onClick={courseClick} className={styles.course}>
      <div className={styles.image}>
        <p className={styles.hoverText}>{courseName}</p>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.name}>{courseName}</p>
        <p className={styles.author}>
          {lang.authorPrefix}{' '}
          {`${course.owner.name.first} ${course.owner.name.last}`}
        </p>
      </div>
    </div>
  );
};

export default CoursePreview;
