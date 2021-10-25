import {
  Publisher,
  PhaseItemQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseItemQueueRemovePublisher extends Publisher<PhaseItemQueueRemoveEvent> {
  subject: Subjects.PhaseItemQueueRemove = Subjects.PhaseItemQueueRemove;
}
