/** @format */

import { Subjects } from '../';

export interface PhaseRemovedEvent {
  subject: Subjects.PhaseRemoved;
  data: {
    phaseId: string;
    parentCourse: string;
  };
}