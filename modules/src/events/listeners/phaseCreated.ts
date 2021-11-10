import {
  Listener,
  Subjects,
  PhaseCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Module from '../../models/module';
import logger from '../../utils/logger';

export class PhaseCreatedListener extends Listener<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseCreatedEvent['data'], msg: Message) {
    const { phaseId, parentModuleId, name } = data;

    logger.info('Adding phase to module');

    logger.debug('Looking up phase');
    const _module = await Module.findById(parentModuleId);

    if (!_module) {
      logger.error("No module found. This shouldn't really happen");
      return msg.ack();
    }

    const phase = {
      id: phaseId,
      name,
      hidden: true,
      locked: true,
    };

    logger.debug('Pushing phase to module');
    _module.phases?.push(phase);

    logger.debug('Saving module');
    await _module.save();

    logger.info('Successfully added phase to module');
    msg.ack();
  }
}
