import {
  Publisher,
  GroupCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class GroupCreatedPublisher extends Publisher<GroupCreatedEvent> {
  subject: Subjects.GroupCreated = Subjects.GroupCreated;
}
