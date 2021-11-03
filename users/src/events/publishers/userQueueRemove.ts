import {
  Publisher,
  UserQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class UserQueueRemovePublisher extends Publisher<UserQueueRemoveEvent> {
  subject: Subjects.UserQueueRemove = Subjects.UserQueueRemove;
}
