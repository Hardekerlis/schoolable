import {
  Listener,
  PhaseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import logger from '../../utils/logger';

import { queueGroupName } from './queueGroupName';
import removePhaseQueue from '../../queues/removePhaseQueue';

export class PhaseQueueRemoveListener extends Listener<PhaseQueueRemoveEvent> {
  subject: Subjects.PhaseQueueRemove = Subjects.PhaseQueueRemove;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseQueueRemoveEvent['data'], msg: Message) {
    const { removeAt, parentCourseId, phaseId } = data;

    const delay = new Date(removeAt).getTime() - new Date().getTime();

    logger.info(`Trying to add phase with id ${phaseId} to remove queue`);

    try {
      await removePhaseQueue.add(
        {
          parentCourseId,
          phaseId,
        },
        {
          delay: delay,
        },
      );
    } catch (err) {
      console.error(err);
    }

    logger.info(
      `Waiting ${delay} milliseconds before removing phase with id ${phaseId}`,
    );

    msg.ack();
  }
}
