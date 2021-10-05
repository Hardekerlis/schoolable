/** @format */

import { Subjects } from '../';

export interface PhaseItemQueueRemoveEvent {
  subject: Subjects.PhaseItemQueueRemove;
  data: {
    parentPhase: string;
    parentCourse: string;
    phaseItemId: string;
    removeAt: Date;
  };
}
