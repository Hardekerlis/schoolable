import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import Module from '../../models/module';
import logger from '../../utils/logger';

export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;

    logger.info('Removing course and its modules');

    logger.debug(`Finding and removing course with id ${courseId}`);
    await Course.findByIdAndRemove(courseId);
    logger.debug('Removed course');

    logger.debug('Looking up modules associated with course');
    const modules = await Module.find({ parentCourseId: courseId });

    logger.debug('Checking if any modules where found');
    if (modules[0]) {
      logger.debug('Removing modules');
      for (const module in modules) {
        await modules[module].remove();
      }
      logger.debug('Removed modules');
    }

    logger.info('Removed course and its modules');

    msg.ack();
  }
}
