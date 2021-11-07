import {
  Publisher,
  PhaseCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseCreatedPublisher extends Publisher<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
}
