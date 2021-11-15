import {
  Listener,
  Subjects,
  ModuleRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Module from '../../../models/module';
import Phase from '../../../models/phase';
import logger from '../../../utils/logger';

export class ModuleRemovedListener extends Listener<ModuleRemovedEvent> {
  subject: Subjects.ModuleRemoved = Subjects.ModuleRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: ModuleRemovedEvent['data'], msg: Message) {
    const { moduleId, parentCourseId } = data;

    logger.info(
      `Deleting module reference ${moduleId} and its modules and phases`,
    );

    logger.debug('Deleting phases');
    const amountOfRemovedPhases = await Phase.deleteMany({
      parentCourse: parentCourseId,
    });
    logger.debug(`Deleted ${amountOfRemovedPhases} phases`);

    logger.debug('Deleting module');
    await Module.findByIdAndDelete(moduleId);

    logger.info('Deleted phase from and its children');

    msg.ack();
  }
}
