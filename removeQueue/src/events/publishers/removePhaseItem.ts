import {
  Publisher,
  RemovePhaseItemEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export class RemovePhaseItemPublisher extends Publisher<RemovePhaseItemEvent> {
  subject: Subjects.RemovePhaseItem = Subjects.RemovePhaseItem;
}
