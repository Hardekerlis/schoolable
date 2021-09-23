/** @format */

import { Subjects } from '../subjects.enum';

export interface UserUpdatedEvent {
  subject: Subjects.UserUpdated;
  data: {
    userId: string;
  };
}
