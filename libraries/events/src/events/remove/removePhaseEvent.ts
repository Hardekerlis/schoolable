/** @format */

import { Subjects } from '../';

export interface RemovePhaseEvent {
  subject: Subjects.RemovePhase;
  data: {
    parentCourse: string;
    phaseId: string;
  };
}
