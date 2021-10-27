/** @format */

import { Subjects } from '../subjects.enum';

export interface AuthLoginEvent {
  subject: Subjects.AuthLogin;
  data: {
    userId: string;
    ip: string;
    userAgent: string;
    lang: string;
    loginId: string;
  };
}
