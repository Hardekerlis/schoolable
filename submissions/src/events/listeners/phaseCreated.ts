import {
  Subjects,
  PhaseCreatedEvent,
  Listener,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import logger from '../../utils/logger';

import Phase from '../../models/phase';

export class PhaseCreatedListener extends Listener<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseCreatedEvent['data'], msg: Message) {
    const { phaseId, parentCourseId, name } = data;
    logger.info('Creating phase reference');

    const phase = Phase.build({ id: phaseId, parentCourseId, name });

    logger.debug('Saving phase in database');
    await phase.save();

    logger.info('Saved phase');
    msg.ack();
  }
}
