import {
  Publisher,
  RemoveCourseEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export class RemoveCoursePublisher extends Publisher<RemoveCourseEvent> {
  subject: Subjects.RemoveCourse = Subjects.RemoveCourse;
}
