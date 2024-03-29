/** @format */

import { Subjects } from '../';

export interface CourseUpdatedEvent {
  subject: Subjects.CourseUpdated;
  data: {
    courseId: string;
    name: string;
  };
}
