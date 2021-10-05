import {
  Listener,
  Subjects,
  PhaseRemovedEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Phase from '../../models/phase';
import logger from '../../utils/logger';

export class PhaseRemovedListener extends Listener<PhaseRemovedEvent> {
  subject: Subjects.PhaseRemoved = Subjects.PhaseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseRemovedEvent['data'], msg: Message) {
    const { phaseId, parentCourse } = data;

    logger.info('Removing phase');

    await Phase.findOneAndRemove({ phaseId, parentCourse });

    logger.info('Successfully removed phase from database');

    msg.ack();
  }
}
