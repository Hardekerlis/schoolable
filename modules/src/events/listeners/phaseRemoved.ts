import {
  Listener,
  Subjects,
  PhaseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Module from '../../models/module';
import logger from '../../utils/logger';

export class PhaseRemovedListener extends Listener<PhaseRemovedEvent> {
  subject: Subjects.PhaseRemoved = Subjects.PhaseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseRemovedEvent['data'], msg: Message) {
    const { phaseId, parentModuleId } = data;

    logger.info('Removing phase from module');

    logger.debug('Looking up phases');
    const _module = await Module.findById(parentModuleId);

    if (!_module) {
      logger.error("No module found. This shouldn't really happen");
      return msg.ack();
    }

    const phases = _module.phases;

    logger.debug('Making sure there is a phase to remove');
    if (phases && phases[0]) {
      logger.debug('Looping through phases');
      for (let i = 0; i < phases.length; i++) {
        if (phases[i].id === phaseId) {
          phases.splice(i, 1);
        }
      }
    } else logger.error('No phases to loop through. This is an error!');

    msg.ack();
  }
}
