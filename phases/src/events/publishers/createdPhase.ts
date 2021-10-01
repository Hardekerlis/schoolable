import {
  Publisher,
  PhaseCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class PhaseCreatedPublisher extends Publisher<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
}
