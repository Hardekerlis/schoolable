import { Subjects } from '../';

export interface RemovePhaseEvent {
  subject: Subjects.RemovePhase;
  data: {
    phaseId: string;
    parentCourseId: string;
    parentModuleId: string;
  };
}
