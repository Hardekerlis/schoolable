/** @format */

import { Subjects } from '../';

export interface GroupCreatedEvent {
  subject: Subjects.GroupCreated;
  data: {
    groupId: string;
    name: string;
    users: string[];
  };
}
