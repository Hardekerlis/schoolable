/** @format */

import { Subjects } from '../subjects.enum';

export interface UserLoginEvent {
  subject: Subjects.UserLogin;
  data: {
    userId: string;
    ip: string;
    userAgent: string;
    lang: string;
    loginId: string;
  };
}
