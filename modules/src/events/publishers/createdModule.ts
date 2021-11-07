import {
  Publisher,
  ModuleCreatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class ModuleCreatedPublisher extends Publisher<
  ModuleCreatedEvent
> {
  subject: Subjects.ModuleCreated = Subjects.ModuleCreated;
}
