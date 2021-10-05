import {
  Listener,
  Subjects,
  PhaseCreatedEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Phase from '../../models/phase';
import logger from '../../utils/logger';

export class PhaseCreatedListener extends Listener<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseCreatedEvent['data'], msg: Message) {
    const { phaseId, parentCourse } = data;

    logger.info('Creating phase');

    logger.debug('Building phase');
    const phase = Phase.build({ phaseId, parentCourse });

    logger.debug('Saving phase');
    await phase.save();

    logger.info('Successfully saved phase to database');

    logger.info('Updated course');

    msg.ack();
  }
}
