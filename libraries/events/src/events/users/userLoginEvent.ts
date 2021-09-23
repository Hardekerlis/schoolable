/** @format */

import { Subjects } from '../subjects.enum';

export interface UserLoginEvent {
  subject: Subjects.UserLogin;
  data: {
    userId: string;
    lastSeen: Date;
  };
}
