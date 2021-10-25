import {
  Publisher,
  PhaseRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseRemovedPublisher extends Publisher<PhaseRemovedEvent> {
  subject: Subjects.PhaseRemoved = Subjects.PhaseRemoved;
}
