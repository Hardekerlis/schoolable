import {
  Publisher,
  PhaseItemCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseItemCreatedPublisher extends Publisher<PhaseItemCreatedEvent> {
  subject: Subjects.PhaseItemCreated = Subjects.PhaseItemCreated;
}
