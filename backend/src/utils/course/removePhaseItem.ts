/** @format */
import { CourseDoc } from '../../models/course';

const removePhaseItem = async (course: CourseDoc) => {
  // Remove phaseItem
  return { error: false, msg: 'success' };
};

export default removePhaseItem;
