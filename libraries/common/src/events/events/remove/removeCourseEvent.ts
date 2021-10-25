/** @format */

import { Subjects } from '../';

export interface RemoveCourseEvent {
  subject: Subjects.RemoveCourse;
  data: {
    courseId: string;
  };
}
