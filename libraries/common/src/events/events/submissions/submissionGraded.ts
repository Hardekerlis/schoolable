/** @format */

import { Subjects } from '../subjects.enum';
import { Grades } from '../../../';

export interface SubmissionGradedEvent {
  subject: Subjects.SubmissionGraded;
  data: {
    userId: string;
    grade: Grades;
  };
}
