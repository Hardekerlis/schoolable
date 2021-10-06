import {
  Publisher,
  PhaseItemCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class PhaseItemCreatedPublisher extends Publisher<PhaseItemCreatedEvent> {
  subject: Subjects.PhaseItemCreated = Subjects.PhaseItemCreated;
}
