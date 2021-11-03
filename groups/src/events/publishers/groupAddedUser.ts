import {
  Publisher,
  GroupAddedUserEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class GroupAddedUserPublisher extends Publisher<GroupAddedUserEvent> {
  subject: Subjects.GroupAddedUser = Subjects.GroupAddedUser;
}
