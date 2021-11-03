/** @format */

import { Subjects } from '../';

export interface GroupRemovedUserEvent {
  subject: Subjects.GroupRemoved;
  data: {
    groupId: string;
    name: string;
    users: string[];
  };
}
