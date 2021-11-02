/** @format */

import { Subjects } from '../../';

export interface CourseRemovedAdminEvent {
  subject: Subjects.CourseRemovedAdmin;
  data: {
    adminId: string;
    courseId: string;
  };
}
