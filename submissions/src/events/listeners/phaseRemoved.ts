import {
  Listener,
  Subjects,
  PhaseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Phase from '../../models/phase';
import PhaseItem from '../../models/phaseItem';
import logger from '../../utils/logger';

export class PhaseRemovedListener extends Listener<PhaseRemovedEvent> {
  subject: Subjects.PhaseRemoved = Subjects.PhaseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseRemovedEvent['data'], msg: Message) {
    const { phaseId, parentCourseId } = data;

    logger.info('Removing phase');

    const { deletedCount } = await PhaseItem.deleteMany({
      parentPhaseId: phaseId,
      parentCourseId,
    });

    logger.debug(
      `Removed ${deletedCount} phase items which belonged to phase with id ${phaseId}`,
    );

    await Phase.findOneAndRemove({ phaseId, parentCourseId });

    logger.info('Successfully removed phase from database');

    msg.ack();
  }
}
