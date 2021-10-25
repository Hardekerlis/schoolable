import {
  Publisher,
  CourseCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseCreatedPublisher extends Publisher<CourseCreatedEvent> {
  subject: Subjects.CourseCreated = Subjects.CourseCreated;
}
