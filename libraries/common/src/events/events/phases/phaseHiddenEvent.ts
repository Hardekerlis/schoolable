import { Subjects } from '../';

export interface PhaseHiddenEvent {
  subject: Subjects.PhaseHidden;
  data: {
    phaseId: string;
    parentModuleId: string;
    parentCourseId: string;
    hidden: boolean;
  };
}
