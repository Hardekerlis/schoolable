/** @format */

import { Subjects } from '../subjects.enum';

export interface SubmissionUploadedEvent {
  subject: Subjects.SubmissionUploaded;
  data: {
    courseName: string;
    moduleName: string;
    phaseName: string;
    fileNames: string[];
    userId: string;
  };
}
