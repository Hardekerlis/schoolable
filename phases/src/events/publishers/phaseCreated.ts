import {
  Publisher,
  PhaseCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class PhaseCreatedPublisher extends Publisher<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
}
