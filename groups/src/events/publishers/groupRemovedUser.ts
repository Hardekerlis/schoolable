import {
  Publisher,
  GroupRemovedUserEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class GroupRemovedUserPublisher extends Publisher<GroupRemovedUserEvent> {
  subject: Subjects.GroupRemovedUser = Subjects.GroupRemovedUser;
}
