import {
  Publisher,
  UserCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
