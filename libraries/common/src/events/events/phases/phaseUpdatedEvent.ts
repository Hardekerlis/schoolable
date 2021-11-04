/** @format */

import { Subjects } from '../';

export interface PhaseUpdatedEvent {
  subject: Subjects.PhaseUpdated;
  data: {
    phaseId: string;
    parentCourseId: string;
  };
}
