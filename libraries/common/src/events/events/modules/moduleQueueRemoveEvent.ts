/** @format */

import { Subjects } from '../';

export interface ModuleQueueRemoveEvent {
  subject: Subjects.ModuleQueueRemove;
  data: {
    moduleId: string;
    parentCourseId: string;
    removeAt: Date;
  };
}
