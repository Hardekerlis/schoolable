import {
  Publisher,
  RemovePhaseEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';

export class RemovePhasePublisher extends Publisher<RemovePhaseEvent> {
  subject: Subjects.RemovePhase = Subjects.RemovePhase;
}
