/** @format */

import { Subjects } from '../';

export interface ModuleUpdatedEvent {
  subject: Subjects.ModuleUpdated;
  data: {
    moduleId: string;
    parentCourseId: string;
  };
}
