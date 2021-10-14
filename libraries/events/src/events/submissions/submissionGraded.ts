/** @format */

import { Subjects } from '../subjects.enum';
import { Grades } from '@gustafdahl/schoolable-enums';

export interface SubmissionGradedEvent {
  subject: Subjects.SubmissionGraded;
  data: {
    userId: string;
    grade: Grades;
  };
}
