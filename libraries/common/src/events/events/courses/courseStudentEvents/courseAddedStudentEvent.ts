/** @format */

import { Subjects } from '../../';

export interface CourseAddedStudentEvent {
  subject: Subjects.CourseAddedStudent;
  data: {
    studentId: string;
    courseId: string;
  };
}
