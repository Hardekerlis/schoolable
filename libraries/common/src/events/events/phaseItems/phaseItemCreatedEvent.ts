/** @format */

import { Subjects } from '../';

export interface PhaseItemCreatedEvent {
  subject: Subjects.PhaseItemCreated;
  data: {
    parentPhase: string;
    parentCourse: string;
    phaseItemId: string;
    name: string;
  };
}
