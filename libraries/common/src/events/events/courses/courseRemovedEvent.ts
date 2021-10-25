/** @format */

import { Subjects } from '../';

export interface CourseRemovedEvent {
  subject: Subjects.CourseRemoved;
  data: {
    courseId: string;
  };
}
