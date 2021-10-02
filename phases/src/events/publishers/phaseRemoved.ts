import {
  Publisher,
  PhaseRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class PhaseRemovedPublisher extends Publisher<PhaseRemovedEvent> {
  subject: Subjects.PhaseRemoved = Subjects.PhaseRemoved;
}
