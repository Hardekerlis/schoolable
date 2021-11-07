import {
  Publisher,
  PhaseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseQueueRemovePublisher extends Publisher<PhaseQueueRemoveEvent> {
  subject: Subjects.PhaseQueueRemove = Subjects.PhaseQueueRemove;
}
