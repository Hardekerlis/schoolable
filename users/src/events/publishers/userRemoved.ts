import {
  Publisher,
  UserRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class UserRemovedPublisher extends Publisher<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
}
