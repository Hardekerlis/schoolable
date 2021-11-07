/** @format */

import { Subjects } from '../';

export interface ModuleRemovedEvent {
  subject: Subjects.ModuleRemoved;
  data: {
    moduleId: string;
    parentCourseId: string;
  };
}
