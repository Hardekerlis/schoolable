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
    const { parentPhase, parentCourse, phaseItemId } = data;

    logger.info('Removing phase item');

    await PhaseItem.findOneAndRemove({
      parentPhase,
      parentCourse,
      phaseItemId,
    });

    logger.info('Successfully removed phase item from database');

    msg.ack();
  }
}
