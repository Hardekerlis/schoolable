/** @format */

import { Subjects } from '../subjects.enum';

export interface UserRemovedEvent {
  subject: Subjects.UserRemoved;
  data: {
    userId: string;
  };
}
