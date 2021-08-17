/** @format */
import { CourseDoc } from '../../models/course';
import CoursePage from '../../models/coursePage';

import { logger } from '../../logger/logger';
import removePhases from './removePhases';

const removeCoursePage = async (course: CourseDoc) => {
  const coursePage = await CoursePage.findById(course.coursePage);

  if (!coursePage) {
    throw new Error('Ran into an unexpecter error');
  }

  await removePhases(coursePage);

  coursePage.upForDeletion = new Date();

  try {
    coursePage.save();
    return {
      error: false,
      msg: 'Successfully set course up for deletion',
      upForDeletion: coursePage.upForDeletion,
    };
  } catch (err) {
    logger.error(`Ran into an unexpected error. Error message: ${err}`);
    return { error: true, msg: 'Ran into an unexpected error.', errorMsg: err };
  }
};

export default removeCoursePage;
