import {
  Subjects,
  PhaseCreatedEvent,
  Listener,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import logger from '../../utils/logger';

import Phase from '../../models/phase';

export class PhaseCreatedListener extends Listener<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseCreatedEvent['data'], msg: Message) {
    const { phaseId, parentCourse, name } = data;
    logger.info('Creating phase reference');

    const phase = Phase.build({ phaseId, parentCourse, name });

    logger.debug('Saving phase in database');
    await phase.save();

    logger.info('Saved phase');
    msg.ack();
  }
}
