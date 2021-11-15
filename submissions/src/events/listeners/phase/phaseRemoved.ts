import {
  Listener,
  Subjects,
  PhaseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Phase from '../../../models/phase';
import logger from '../../../utils/logger';

export class PhaseRemovedListener extends Listener<PhaseRemovedEvent> {
  subject: Subjects.PhaseRemoved = Subjects.PhaseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseRemovedEvent['data'], msg: Message) {
    const { phaseId } = data;

    logger.info(`Removing phase with id ${phaseId}`);

    const phase = await Phase.findByIdAndRemove(phaseId);
    if (!phase) {
      logger.error('No phase found');
    }

    logger.info('Successfully removed phase from database');

    msg.ack();
  }
}
