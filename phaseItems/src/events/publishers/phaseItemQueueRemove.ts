import {
  Publisher,
  PhaseItemQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class PhaseItemQueueRemovePublisher extends Publisher<PhaseItemQueueRemoveEvent> {
  subject: Subjects.PhaseItemQueueRemove = Subjects.PhaseItemQueueRemove;
}
