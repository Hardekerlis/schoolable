import { Subjects } from '../';

export interface PhaseQueueRemoveEvent {
  subject: Subjects.PhaseQueueRemove;
  data: {
    phaseId: string;
    parentCourseId: string;
    parentModuleId: string;
    removeAt: Date;
  };
}
