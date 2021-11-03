import {
  Publisher,
  CourseAddedStudentEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseAddedStudentPublisher extends Publisher<CourseAddedStudentEvent> {
  subject: Subjects.CourseAddedStudent = Subjects.CourseAddedStudent;
}
