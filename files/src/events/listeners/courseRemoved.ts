import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';

import Course from '../../models/course';
import File from '../../models/file';

import logger from '../../utils/logger';

export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;
    logger.info(`Removing course reference with id ${courseId}`);

    logger.debug('Looking up course and removing it');
    const course = await Course.findOneAndRemove({ courseId });

    if (!course) {
      logger.error(`Couldn't find a course with id ${courseId} to remove`);
      return msg.ack();
    }

    logger.info('Found and removed course');

    msg.ack();
  }
}
