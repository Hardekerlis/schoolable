import {
  Publisher,
  CourseRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class CourseRemovedPublisher extends Publisher<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
}
