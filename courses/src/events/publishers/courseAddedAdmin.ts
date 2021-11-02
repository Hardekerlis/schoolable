import {
  Publisher,
  CourseAddedAdminEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseAddedAdminPublisher extends Publisher<CourseAddedAdminEvent> {
  subject: Subjects.CourseAddedAdmin = Subjects.CourseAddedAdmin;
}
