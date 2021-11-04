import {
  Listener,
  Subjects,
  RemovePhaseEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Phase from '../../models/phase';
import logger from '../../utils/logger';
import PhaseRemovedPublisher from '../publishers/phaseRemoved';

export class RemovePhaseListener extends Listener<RemovePhaseEvent> {
  subject: Subjects.RemovePhase = Subjects.RemovePhase;
  queueGroupName = queueGroupName;

  async onMessage(data: RemovePhaseEvent['data'], msg: Message) {
    const { phaseId, parentCourseId } = data;

    logger.info('Removing phase');

    logger.debug(`Finding and removing phase with id ${phaseId}`);
    await Phase.findOneAndRemove({
      $and: [{ id: phaseId }, { parentCourseId }],
    });
    logger.debug('Removed phase');

    logger.info('Publishing phase was deleted');
    new PhaseRemovedPublisher(this.client, logger).publish({
      phaseId,
      parentCourseId,
    });

    msg.ack();
  }
}
