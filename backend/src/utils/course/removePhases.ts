/** @format */
import { CoursePageDoc } from '../../models/coursePage';
import Phase from '../../models/phase';

import removePhaseItem from './removePhaseItem';

const removePhases = async (coursePage: CoursePageDoc) => {
  await removePhaseItem(coursePage);
  return { error: false, msg: 'success' };
};

export default removePhases;
