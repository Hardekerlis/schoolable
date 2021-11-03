/** @format */

import { Subjects } from '../../';

export interface CourseAddedAdminEvent {
  subject: Subjects.CourseAddedAdmin;
  data: {
    adminId: string;
    courseId: string;
  };
}
