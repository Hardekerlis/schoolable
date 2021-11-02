/** @format */

import { Subjects } from '../../';

export interface CourseRemovedStudentEvent {
  subject: Subjects.CourseRemovedStudent;
  data: {
    studentId: string;
    courseId: string;
  };
}
