/** @format */

import { Subjects } from '../';

export interface RemoveUserEvent {
  subject: Subjects.RemoveUser;
  data: {
    userId: string;
  };
}
