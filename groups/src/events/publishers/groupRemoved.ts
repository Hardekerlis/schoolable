import {
  Publisher,
  GroupRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class GroupRemovedPublisher extends Publisher<GroupRemovedEvent> {
  subject: Subjects.GroupRemoved = Subjects.GroupRemoved;
}
