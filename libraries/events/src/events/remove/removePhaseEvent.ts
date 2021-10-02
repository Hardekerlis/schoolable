/** @format */

import { Subjects } from '../';

export interface RemovePhaseEvent {
  subject: Subjects.RemoveUser;
  data: {
    parentCourse: string;
    phaseId: string;
    removeAt: Date;
  };
}
