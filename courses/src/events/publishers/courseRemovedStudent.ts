import {
  Publisher,
  CourseRemovedStudentEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseRemovedStudentPublisher extends Publisher<CourseRemovedStudentEvent> {
  subject: Subjects.CourseRemovedStudent = Subjects.CourseRemovedStudent;
}
