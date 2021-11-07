import {
  Listener,
  Subjects,
  RemoveModuleEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Module from '../../models/module';
import logger from '../../utils/logger';
import ModuleRemovedPublisher from '../publishers/moduleRemoved';

export class RemoveModuleListener extends Listener<RemoveModuleEvent> {
  subject: Subjects.RemoveModule = Subjects.RemoveModule;
  queueGroupName = queueGroupName;

  async onMessage(data: RemoveModuleEvent['data'], msg: Message) {
    const { moduleId, parentCourseId } = data;

    logger.info('Removing module');

    logger.debug(`Finding and removing module with id ${moduleId}`);
    await Module.findOneAndRemove({
      $and: [{ id: moduleId }, { parentCourseId }],
    });
    logger.debug('Removed module');

    logger.info('Publishing module was deleted');
    new ModuleRemovedPublisher(this.client, logger).publish({
      moduleId,
      parentCourseId,
    });

    msg.ack();
  }
}
