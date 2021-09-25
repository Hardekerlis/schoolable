import {
  Publisher,
  UserLogoutEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class UserLogoutPublisher extends Publisher<UserLogoutEvent> {
  subject: Subjects.UserLogout = Subjects.UserLogout;
}
