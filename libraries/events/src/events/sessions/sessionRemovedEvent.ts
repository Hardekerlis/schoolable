/** @format */

import { Subjects } from '../subjects.enum';

export interface SessionRemovedEvent {
  subject: Subjects.SessionRemoved;
  data: {
    sessionId: string; // This is id contained in jwt token
  };
}
