import {
  Listener,
  PhaseItemQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import logger from '../../utils/logger';

import { queueGroupName } from './queueGroupName';
import removePhaseItemQueue from '../../queues/removePhaseItemQueue';

export class PhaseItemQueueRemoveListener extends Listener<PhaseItemQueueRemoveEvent> {
  subject: Subjects.PhaseItemQueueRemove = Subjects.PhaseItemQueueRemove;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseItemQueueRemoveEvent['data'], msg: Message) {
    const { removeAt, parentCourse, parentPhase, phaseItemId } = data;

    const delay = new Date(removeAt).getTime() - new Date().getTime();

    logger.info(
      `Trying to add phase item with id ${phaseItemId} to remove queue`,
    );

    try {
      await removePhaseItemQueue.add(
        {
          parentCourse,
          parentPhase,
          phaseItemId,
        },
        {
          delay: delay,
        },
      );
    } catch (err) {
      console.error(err);
    }

    logger.info(
      `Waiting ${delay} milliseconds before removing phase item with id ${phaseItemId}`,
    );

    msg.ack();
  }
}
