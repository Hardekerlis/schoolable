import {
  Publisher,
  UserLoginEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class UserLoginPublisher extends Publisher<UserLoginEvent> {
  subject: Subjects.UserLogin = Subjects.UserLogin;
}
