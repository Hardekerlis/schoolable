import {
  Publisher,
  SubmissionGradedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class SubmissionGradedPublisher extends Publisher<SubmissionGradedEvent> {
  subject: Subjects.SubmissionGraded = Subjects.SubmissionGraded;
}
