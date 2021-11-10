import {
  Publisher,
  ModuleUpdatedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class ModuleUpdatedPublisher extends Publisher<ModuleUpdatedEvent> {
  subject: Subjects.ModuleUpdated = Subjects.ModuleUpdated;
}
