import {
  Publisher,
  UserRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class UserRemovedPublisher extends Publisher<UserRemovedEvent> {
  subject: Subjects.UserLogin = Subjects.UserLogin;
}
