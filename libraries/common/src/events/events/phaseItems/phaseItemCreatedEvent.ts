/** @format */

import { Subjects } from '../';

export interface PhaseItemCreatedEvent {
  subject: Subjects.PhaseItemCreated;
  data: {
    parentPhaseId: string;
    parentCourseId: string;
    phaseItemId: string;
    name: string;
  };
}
