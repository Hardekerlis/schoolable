/** @format */

import { Subjects } from '../subjects.enum';
import { UserTypes } from '@gustafdahl/schoolable-enums';

export interface UserCreatedEvent {
  subject: Subjects.UserCreated;
  data: {
    userId: string;
    email: string;
    userType: UserTypes;
    tempPassword: string;
    name: {
      first: string;
      last: string;
    };
  };
}
