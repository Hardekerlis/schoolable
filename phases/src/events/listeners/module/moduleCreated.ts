import {
  Listener,
  Subjects,
  ModuleCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Module from '../../../models/module';
import logger from '../../../utils/logger';

export class ModuleCreatedListener extends Listener<ModuleCreatedEvent> {
  subject: Subjects.ModuleCreated = Subjects.ModuleCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ModuleCreatedEvent['data'], msg: Message) {
    const { moduleId, parentCourseId, name } = data;

    logger.info(`Creating module reference for module ${moduleId}`);

    logger.debug('Building module');
    const _module = Module.build({
      id: moduleId,
      parentCourse: parentCourseId,
      name,
    });

    logger.debug('Saving module');
    await _module.save();

    logger.info('Successfully create module reference');
    msg.ack();
  }
}
