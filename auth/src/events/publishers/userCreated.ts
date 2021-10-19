import {
  Publisher,
  UserCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
