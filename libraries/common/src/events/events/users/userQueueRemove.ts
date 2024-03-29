/** @format */

import { Subjects } from '../';

export interface UserQueueRemoveEvent {
  subject: Subjects.UserQueueRemove;
  data: {
    userId: string;
    removingAdmin: string;
    removeAt: Date;
  };
}
