import {
  Publisher,
  ModuleRemovedEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';

export default class ModuleRemovedPublisher extends Publisher<ModuleRemovedEvent> {
  subject: Subjects.ModuleRemoved = Subjects.ModuleRemoved;
}
