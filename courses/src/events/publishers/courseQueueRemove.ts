import {
  Publisher,
  CourseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class CourseQueueRemovePublisher extends Publisher<CourseQueueRemoveEvent> {
  subject: Subjects.CourseQueueRemove = Subjects.CourseQueueRemove;
}
