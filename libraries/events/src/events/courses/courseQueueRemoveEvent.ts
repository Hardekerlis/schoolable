/** @format */

import { Subjects } from '../';

export interface CourseQueueRemoveEvent {
  subject: Subjects.CourseQueueRemove;
  data: {
    courseId: string;
    removeAt: Date;
  };
}
