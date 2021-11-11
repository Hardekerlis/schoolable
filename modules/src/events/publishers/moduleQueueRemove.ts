import {
  Publisher,
  ModuleQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class ModuleQueueRemovePublisher extends Publisher<ModuleQueueRemoveEvent> {
  subject: Subjects.ModuleQueueRemove = Subjects.ModuleQueueRemove;
}
