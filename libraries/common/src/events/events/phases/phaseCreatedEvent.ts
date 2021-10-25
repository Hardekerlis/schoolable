/** @format */

import { Subjects } from '../';

export interface PhaseCreatedEvent {
  subject: Subjects.PhaseCreated;
  data: {
    phaseId: string;
    parentCourse: string;
    name: string;
  };
}
