import {
  Listener,
  Subjects,
  PhaseCreatedEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import logger from '../../utils/logger';

// REVIEW: This might not be neccessary
export class PhaseCreatedListener extends Listener<PhaseCreatedEvent> {
  subject: Subjects.PhaseCreated = Subjects.PhaseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PhaseCreatedEvent['data'], msg: Message) {
    const { phaseId, parentCourse } = data;
    logger.info('Adding phase to course');
    logger.debug('Looking up course');
    const course = await Course.findById(parentCourse).populate('coursePage');

    if (!course) {
      logger.debug('No course found');
      return msg.ack();
    }

    logger.debug('Saving course page');
    await course.coursePage.save();

    logger.info('Added phase to course');
    msg.ack();
  }
}
