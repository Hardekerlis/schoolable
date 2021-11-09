import { Subjects } from '../';

export interface PhaseLockedEvent {
  subject: Subjects.PhaseLocked;
  data: {
    moduleId: string;
    parentCourseId: string;
    locked: boolean;
  };
}
