/** @format */

import { Subjects } from '../subjects.enum';
import { Grades } from '../../../';

export interface SubmissionUploadedEvent {
  subject: Subjects.SubmissionUploaded;
  data: {
    userId: string;
    fileName: string;
    fileId: string;
  };
}
