import {
  Publisher,
  SubmissionGradedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class SubmissionGradedPublisher extends Publisher<SubmissionGradedEvent> {
  subject: Subjects.SubmissionGraded = Subjects.SubmissionGraded;
}
