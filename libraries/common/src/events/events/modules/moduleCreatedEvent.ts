/** @format */

import { Subjects } from '../';

export interface ModuleCreatedEvent {
  subject: Subjects.ModuleCreated;
  data: {
    moduleId: string;
    parentCourseId: string;
    name: string;
  };
}
