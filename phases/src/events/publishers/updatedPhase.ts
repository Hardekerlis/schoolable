import {
  Publisher,
  PhaseUpdatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseUpdatedPublisher extends Publisher<PhaseUpdatedEvent> {
  subject: Subjects.PhaseUpdated = Subjects.PhaseUpdated;
}
