import {
  Subjects,
  CourseCreatedEvent,
  Listener,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Course from '../../../models/course';
import logger from '../../../utils/logger';

export class CourseCreatedListener extends Listener<CourseCreatedEvent> {
  subject: Subjects.CourseCreated = Subjects.CourseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseCreatedEvent['data'], msg: Message) {
    const { courseId, owner } = data;
    logger.info('Creating course reference');

    logger.debug('Building course');
    const course = Course.build({ id: courseId, owner });

    logger.debug('Saving course in database');
    await course.save();

    logger.info('Saved course');
    msg.ack();
  }
}
