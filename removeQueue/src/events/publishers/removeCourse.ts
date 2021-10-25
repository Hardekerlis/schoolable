import {
  Publisher,
  RemoveCourseEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class RemoveCoursePublisher extends Publisher<RemoveCourseEvent> {
  subject: Subjects.RemoveCourse = Subjects.RemoveCourse;
}
