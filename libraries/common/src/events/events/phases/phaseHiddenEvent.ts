import { Subjects } from '../';

export interface PhaseHiddenEvent {
  subject: Subjects.PhaseHidden;
  data: {
    moduleId: string;
    parentCourseId: string;
    hidden: boolean;
  };
}
