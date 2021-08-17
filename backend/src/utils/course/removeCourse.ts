/** @format */

import { CourseDoc } from '../../models/course';

import { logger } from '../../logger/logger';

import removeCoursePage from './removeCoursePage';

const removeCourse = async (course: CourseDoc) => {
  const res = await removeCoursePage(course);

  if (res.error) {
    return {
      error: true,
      msg: 'Ran into an unexpected error.',
      errorMsg: res.error,
    };
  }

  course.upForDeletion = new Date();

  try {
    course.save();
    return {
      error: false,
      msg: 'Successfully set course up for deletion',
      upForDeletion: course.upForDeletion,
    };
  } catch (err) {
    logger.error(`Ran into an unexpected error. Error message: ${err}`);
    return { error: true, msg: 'Ran into an unexpected error.', errorMsg: err };
  }
};

export default removeCourse;
