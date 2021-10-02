import {
  Publisher,
  PhaseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class PhaseQueueRemovePublisher extends Publisher<PhaseQueueRemoveEvent> {
  subject: Subjects.PhaseQueueRemove = Subjects.PhaseQueueRemove;
}
