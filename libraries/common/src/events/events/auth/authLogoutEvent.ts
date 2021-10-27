/** @format */

import { Subjects } from '../subjects.enum';

export interface AuthLogoutEvent {
  subject: Subjects.AuthLogout;
  data: {
    userId: string;
    loginId: string;
  };
}
