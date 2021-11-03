/** @format */

import { Subjects } from '../';

export interface GroupRemovedEvent {
  subject: Subjects.GroupRemoved;
  data: {
    groupId: string;
  };
}
