/** @format */

import { Subjects } from '../';

export interface PhaseCreatedEvent {
  subject: Subjects.PhaseCreated;
  data: {
    parentModuleId: string;
    parentCourseId: string;
    name: string;
  };
}
