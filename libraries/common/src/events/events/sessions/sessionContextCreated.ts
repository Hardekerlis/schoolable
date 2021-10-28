import { Subjects } from '../subjects.enum';

export interface SessionContextEvent {
  subject: Subjects.SessionContext;
  data: {
    tempPassword: string;
    userId: string;
  };
}
