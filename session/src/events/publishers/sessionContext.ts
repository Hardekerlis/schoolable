import {
  Publisher,
  SessionContextEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class SessionContextPublisher extends Publisher<SessionContextEvent> {
  subject: Subjects.SessionContext = Subjects.SessionContext;
}
