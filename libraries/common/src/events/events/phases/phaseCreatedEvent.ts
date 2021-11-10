/** @format */

import { Subjects } from '../';

export interface PhaseCreatedEvent {
  subject: Subjects.PhaseCreated;
  data: {
    phaseId: string;
    parentModuleId: string;
    parentCourseId: string;
    name: string;
  };
}
