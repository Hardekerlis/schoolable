import {
  Publisher,
  RemoveUserEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class RemoveUserPublisher extends Publisher<RemoveUserEvent> {
  subject: Subjects.RemoveUser = Subjects.RemoveUser;
}
