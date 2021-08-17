/** @format */
import { CourseDoc } from '../../models/course';
import CoursePage, { CoursePageDoc } from '../../models/coursePage';

const removePhaseItem = async (course: CoursePageDoc) => {
  // Remove phaseItem
  return { error: false, msg: 'success' };
};

export default removePhaseItem;
