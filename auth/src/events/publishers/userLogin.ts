import {
  Publisher,
  UserLoginEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class UserLoginPublisher extends Publisher<UserLoginEvent> {
  subject: Subjects.UserLogin = Subjects.UserLogin;
}
