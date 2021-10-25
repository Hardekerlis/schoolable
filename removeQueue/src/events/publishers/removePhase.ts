import {
  Publisher,
  RemovePhaseEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export class RemovePhasePublisher extends Publisher<RemovePhaseEvent> {
  subject: Subjects.RemovePhase = Subjects.RemovePhase;
}
