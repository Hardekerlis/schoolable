/** @format */

import { Subjects } from '../';

export interface PhaseItemRemovedEvent {
  subject: Subjects.PhaseItemRemoved;
  data: {
    parentPhaseId: string;
    parentCourseId: string;
    phaseItemId: string;
  };
}
