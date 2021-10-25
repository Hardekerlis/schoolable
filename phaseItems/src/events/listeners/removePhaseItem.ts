import {
  Listener,
  Subjects,
  RemovePhaseItemEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import PhaseItemRemovedPublisher from '../publishers/phaseItemRemoved';

import { queueGroupName } from './queueGroupName';
import PhaseItem from '../../models/phaseItem';
import logger from '../../utils/logger';

export class RemovePhaseItemListener extends Listener<RemovePhaseItemEvent> {
  subject: Subjects.RemovePhaseItem = Subjects.RemovePhaseItem;
  queueGroupName = queueGroupName;

  async onMessage(data: RemovePhaseItemEvent['data'], msg: Message) {
    const { parentPhase, parentCourse, phaseItemId } = data;

    logger.info('Removing phase item');

    await PhaseItem.findOneAndRemove({
      parentPhase,
      parentCourse,
      id: phaseItemId,
    });

    new PhaseItemRemovedPublisher(this.client, logger).publish({
      phaseItemId,
      parentCourse,
      parentPhase,
    });

    logger.info('Successfully removed phase item from database');

    msg.ack();
  }
}
