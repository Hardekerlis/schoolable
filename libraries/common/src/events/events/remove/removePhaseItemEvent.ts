/** @format */

import { Subjects } from '../';

export interface RemovePhaseItemEvent {
  subject: Subjects.RemovePhaseItem;
  data: {
    parentCourseId: string;
    parentPhaseId: string;
    phaseItemId: string;
  };
}
