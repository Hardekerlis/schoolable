/** @format */

import { Subjects } from '../';

export interface PhaseItemQueueRemoveEvent {
  subject: Subjects.PhaseItemQueueRemove;
  data: {
    parentPhaseId: string;
    parentCourseId: string;
    phaseItemId: string;
    removeAt: Date;
  };
}
