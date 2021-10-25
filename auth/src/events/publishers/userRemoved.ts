import {
  Publisher,
  UserRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class UserRemovedPublisher extends Publisher<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
}
