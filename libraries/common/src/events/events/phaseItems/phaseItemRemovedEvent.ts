/** @format */

import { Subjects } from '../';

export interface PhaseItemRemovedEvent {
  subject: Subjects.PhaseItemRemoved;
  data: {
    parentPhase: string;
    parentCourse: string;
    phaseItemId: string;
  };
}
