/** @format */

import { Subjects } from '../';

export interface RemovePhaseItemEvent {
  subject: Subjects.RemovePhaseItem;
  data: {
    parentCourse: string;
    parentPhase: string;
    phaseItemId: string;
  };
}
