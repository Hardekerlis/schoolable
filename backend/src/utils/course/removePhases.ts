/** @format */
import CoursePage, { CoursePageDoc } from '../../models/coursePage';

import removePhaseItem from './removePhaseItem';

const removePhases = async (coursePage: CoursePageDoc) => {
  await removePhaseItem(coursePage);
  return { error: false, msg: 'success' };
};

export default removePhases;
