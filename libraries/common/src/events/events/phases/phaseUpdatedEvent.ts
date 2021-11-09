/** @format */

import { Subjects } from '../';

export interface PhaseUpdatedEvent {
  subject: Subjects.PhaseUpdated;
  data: {
    parentModuleId: string;
    parentCourseId: string;
    name: string;
  };
}
