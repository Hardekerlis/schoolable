/** @format */

import { Subjects } from '../';

export interface PhaseCreatedEvent {
  subject: Subjects.PhaseCreated;
  data: {
    phaseId: string;
    name: string;
    parentCourse: string;
  };
}
