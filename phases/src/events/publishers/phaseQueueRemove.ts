import {
  Publisher,
  PhaseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class PhaseQueueRemovePublisher extends Publisher<PhaseQueueRemoveEvent> {
  subject: Subjects.PhaseQueueRemove = Subjects.PhaseQueueRemove;
}
