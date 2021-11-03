/** @format */

import { Subjects } from '../';

export interface GroupAddedUserEvent {
  subject: Subjects.GroupAddedUser;
  data: {
    groupId: string;
    name: string;
    users: string[];
  };
}
