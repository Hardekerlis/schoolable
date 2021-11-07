/** @format */

import { Subjects } from '../';

export interface RemoveModuleEvent {
  subject: Subjects.RemoveModule;
  data: {
    parentCourseId: string;
    moduleId: string;
  };
}
