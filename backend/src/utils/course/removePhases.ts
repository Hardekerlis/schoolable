/** @format */

import { BadRequestError } from '@schoolable/common';
import moment from 'moment';

import { CoursePageDoc } from '../../models/coursePage';
import Phase from '../../models/phase';

import removePhaseItem from './removePhaseItem';

const removePhases = async (coursePage: CoursePageDoc) => {
  // Set phases recieved from db to be deleted - for loop

  const phases = await Phase.find({
    id: { $in: [coursePage.phases] },
  });

  if (!phases) {
    return {
      error: true,
      msg: "Couldn't find any phases connected to the coursePage",
    };
  }

  for (const phase of phases) {
    phase.upForDeletion = new Date();
  }

  await removePhaseItem(coursePage);
  return { error: false, msg: 'success' };
};

export default removePhases;
