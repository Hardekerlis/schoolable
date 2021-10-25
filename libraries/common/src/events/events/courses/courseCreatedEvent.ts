/** @format */

import { Subjects } from '../';

export interface CourseCreatedEvent {
  subject: Subjects.CourseCreated;
  data: {
    courseId: string;
    name: string;
    owner: string;
  };
}
