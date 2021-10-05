import {
  Publisher,
  PhaseItemRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export default class PhaseItemRemovedPublisher extends Publisher<PhaseItemRemovedEvent> {
  subject: Subjects.PhaseItemRemoved = Subjects.PhaseItemRemoved;
}
