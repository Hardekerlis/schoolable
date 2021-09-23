/** @format */

import { Subjects } from '../subjects.enum';

export interface UserLogoutEvent {
  subject: Subjects.UserLogout;
  data: {
    userId: string;
  };
}
