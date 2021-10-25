import {
  Publisher,
  RemovePhaseItemEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class RemovePhaseItemPublisher extends Publisher<RemovePhaseItemEvent> {
  subject: Subjects.RemovePhaseItem = Subjects.RemovePhaseItem;
}
