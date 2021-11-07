import {
  Listener,
  Subjects,
  RemovePhaseEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import PhaseRemovedPublisher from '../publishers/phaseRemoved';

import { queueGroupName } from './queueGroupName';
import Phase from '../../models/phase';
import logger from '../../utils/logger';

export class RemovePhaseListener extends Listener<RemovePhaseEvent> {
  subject: Subjects.RemovePhase = Subjects.RemovePhase;
  queueGroupName = queueGroupName;

  async onMessage(data: RemovePhaseEvent['data'], msg: Message) {
    const { parentModuleId, parentCourseId, phaseId } = data;

    logger.info('Removing phase item');

    await Phase.findOneAndRemove({
      parentModuleId,
      parentCourseId,
      id: phaseId,
    });

    new PhaseRemovedPublisher(this.client, logger).publish({
      phaseId,
      parentCourseId,
      parentModuleId,
    });

    logger.info('Successfully removed phase item from database');

    msg.ack();
  }
}
