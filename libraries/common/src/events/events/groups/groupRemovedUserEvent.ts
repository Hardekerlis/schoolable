/** @format */

import { Subjects } from '../';

export interface GroupRemovedUserEvent {
  subject: Subjects.GroupRemovedUser;
  data: {
    groupId: string;
    name: string;
    users: string[];
  };
}
