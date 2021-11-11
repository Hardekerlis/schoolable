import {
  Listener,
  Subjects,
  ModuleCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import logger from '../../utils/logger';

// REVIEW: This might not be neccessary
// TODO: Add phases to course page
export class ModuleCreatedListener extends Listener<ModuleCreatedEvent> {
  subject: Subjects.ModuleCreated = Subjects.ModuleCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ModuleCreatedEvent['data'], msg: Message) {
    const { parentCourseId } = data;
    logger.info('Adding phase to course');
    logger.debug('Looking up course');
    const course = await Course.findById(parentCourseId).populate('coursePage');

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
