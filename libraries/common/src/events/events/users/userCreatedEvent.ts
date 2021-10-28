/** @format */

import { Subjects } from '../subjects.enum';
import { UserTypes } from '../../../';

export interface UserCreatedEvent {
  subject: Subjects.UserCreated;
  data: {
    userId: string;
    email: string;
    userType: UserTypes;
    lang: string;
    name: {
      first: string;
      last: string;
    };
  };
}
