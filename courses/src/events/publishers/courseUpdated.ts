import {
  Publisher,
  CourseUpdatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class CourseUpdatedPublisher extends Publisher<CourseUpdatedEvent> {
  subject: Subjects.CourseUpdated = Subjects.CourseUpdated;
}
