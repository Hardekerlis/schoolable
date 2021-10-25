import {
  Subjects,
  PhaseItemCreatedEvent,
  Listener,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import logger from '../../utils/logger';

import PhaseItem from '../../models/phaseItem';

export class PhaseItemCreatedListener extends Listener<PhaseItemCreatedEvent> {
  subject: Subjects.PhaseItemCreated = Subjects.PhaseItemCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseItemCreatedEvent['data'], msg: Message) {
    logger.info('Creating phase item reference');

    const phaseItem = PhaseItem.build(data);

    logger.debug('Saving phase item in database');
    await phaseItem.save();

    logger.info('Saved phase item');
    msg.ack();
  }
}
