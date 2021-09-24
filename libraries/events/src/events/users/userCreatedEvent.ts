/** @format */

import { Subjects } from '../subjects.enum';

export interface UserCreatedEvent {
  subject: Subjects.UserCreated;
  data: {
    userId: string;
    email: string;
    tempPassword: string;
  };
}
