import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import Phase from '../../models/phase';
import logger from '../../utils/logger';

export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;

    logger.info('Removing course and its phases');

    logger.debug(`Finding and removing course with id ${courseId}`);
    await Course.findByIdAndRemove(courseId);
    logger.debug('Removed course');

    logger.debug('Looking up phases associated with course');
    const phases = await Phase.find({ parentCourse: courseId });

    logger.debug('Checking if any phases where found');
    if (phases[0]) {
      logger.debug('Removing phases');
      for (const phase in phases) {
        await phases[phase].remove();
      }
      logger.debug('Removed phases');
    }

    logger.info('Removed course and its phases');

    msg.ack();
  }
}
