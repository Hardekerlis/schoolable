import {
  Publisher,
  PhaseItemRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class PhaseItemRemovedPublisher extends Publisher<PhaseItemRemovedEvent> {
  subject: Subjects.PhaseItemRemoved = Subjects.PhaseItemRemoved;
}
