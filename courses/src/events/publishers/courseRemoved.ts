import {
  Publisher,
  CourseRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseRemovedPublisher extends Publisher<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
}
