import {
  Publisher,
  CourseRemovedAdminEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseRemovedAdminPublisher extends Publisher<CourseRemovedAdminEvent> {
  subject: Subjects.CourseRemovedAdmin = Subjects.CourseRemovedAdmin;
}
