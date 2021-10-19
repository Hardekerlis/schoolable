/** @format */

import { Subjects } from '../subjects.enum';

export interface UserLoginEvent {
  subject: Subjects.UserLogin;
  data: {
    userId: string;
    ip: string;
    headers: object;
    lang: string;
    loginId: string;
  };
}
