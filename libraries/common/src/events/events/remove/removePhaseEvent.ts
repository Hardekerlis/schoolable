/** @format */

import { Subjects } from '../';

export interface RemovePhaseEvent {
  subject: Subjects.RemovePhase;
  data: {
    parentCourseId: string;
    phaseId: string;
  };
}
