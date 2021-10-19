/** @format */

import { Subjects } from '../subjects.enum';

export interface SessionCreatedEvent {
  subject: Subjects.SessionCreated;
  data: {
    sessionId: string; // This is id contained in jwt token
  };
}
