import {
  Publisher,
  SubmissionUploadedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class SubmissionUploadedPublisher extends Publisher<SubmissionUploadedEvent> {
  subject: Subjects.SubmissionUploaded = Subjects.SubmissionUploaded;
}
