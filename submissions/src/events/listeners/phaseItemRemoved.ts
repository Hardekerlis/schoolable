import {
  Listener,
  Subjects,
  PhaseItemRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import PhaseItem from '../../models/phaseItem';
import logger from '../../utils/logger';

export class PhaseItemRemovedListener extends Listener<PhaseItemRemovedEvent> {
  subject: Subjects.PhaseItemRemoved = Subjects.PhaseItemRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseItemRemovedEvent['data'], msg: Message) {
    const { phaseItemId } = data;

    logger.info(`Removing phase item with id ${phaseItemId}`);

    const phaseItem = await PhaseItem.findByIdAndRemove(phaseItemId);
    if (!phaseItem) {
      logger.error('No phase item found');
    }

    logger.info('Successfully removed phase item from database');

    msg.ack();
  }
}
