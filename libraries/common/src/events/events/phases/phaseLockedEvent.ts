import { Subjects } from '../';

export interface PhaseLockedEvent {
  subject: Subjects.PhaseLocked;
  data: {
    phaseId: string;
    parentModuleId: string;
    parentCourseId: string;
    locked: boolean;
  };
}
