import {
  Publisher,
  CourseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class CourseQueueRemovePublisher extends Publisher<CourseQueueRemoveEvent> {
  subject: Subjects.CourseQueueRemove = Subjects.CourseQueueRemove;
}
