import {
  Subjects,
  PhaseCreatedEvent,
  Listener,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import logger from '../../../utils/logger';

import Phase from '../../../models/phase';
import Module from '../../../models/module';

export class PhaseCreatedListener extends Listener<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseCreatedEvent['data'], msg: Message) {
    const { parentModuleId, phaseId, name } = data;
    logger.info('Creating phase reference');

    logger.debug('Looking up parent module');
    const _module = await Module.findById(parentModuleId);

    if (!_module) {
      logger.error('No parent phase found. This should never happen');
      return msg.ack();
    }
    logger.debug('Found parent module');

    logger.debug('Building phase');
    const phase = Phase.build({
      id: phaseId,
      parentModule: _module,
      name,
    });

    logger.debug('Saving phase in database');
    await phase.save();

    logger.info('Successfully created phase reference');
    msg.ack();
  }
}
