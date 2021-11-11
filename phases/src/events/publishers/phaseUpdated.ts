import {
  Publisher,
  PhaseUpdatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class PhaseUpdatedPublisher extends Publisher<PhaseUpdatedEvent> {
  subject: Subjects.PhaseUpdated = Subjects.PhaseUpdated;
}
