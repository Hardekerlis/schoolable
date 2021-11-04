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

    const phaseItems = await PhaseItem.deleteMany({
      id: phaseId,
      parentCourseId,
    });

    await Phase.findOneAndRemove({ phaseId, parentCourseId });

    logger.info('Successfully removed phase from database');

    msg.ack();
  }
}
